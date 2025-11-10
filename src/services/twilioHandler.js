const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const ConversationMemory = require('../utils/conversationMemory');
const { transcribeAudio } = require('./speechToText');
const { generateSpeech } = require('./textToSpeech');
const { getLLMResponse } = require('./llmService');
const { executeTool } = require('./toolCalling');

// Track active call sessions
const activeSessions = new Map();

/**
 * FR-01: Inbound Call Trigger
 * Handles initial Twilio webhook when a call comes in
 */
function handleIncomingCall(req, res) {
  try {
    const callSid = req.body.CallSid;
    const from = req.body.From;
    const to = req.body.To;
    
    logger.info(`📞 Incoming call from ${from} to ${to} (CallSid: ${callSid})`);
    logger.info(`Request body:`, req.body);
    logger.info(`Request headers:`, req.headers);
    
    // FR-02: Initial Response (TwiML)
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Initial greeting
    twiml.say({
      voice: 'Polly.Joanna'
    }, 'Hello! I am your AI assistant. How can I help you today?');
    
    // FR-03: Real-Time Voice Stream
    // Connect to WebSocket for bidirectional audio streaming
    const connect = twiml.connect();
    
    // Get the host from headers (Railway uses x-forwarded-host)
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'voiceagent-production-0d23.up.railway.app';
    const wsUrl = `wss://${host}/voice/stream`;
    
    logger.info(`🔌 WebSocket URL: ${wsUrl}`);
    
    connect.stream({
      url: wsUrl,
      parameters: {
        callSid: callSid,
        from: from
      }
    });
    
    // Set response content type
    res.type('text/xml');
    const twimlResponse = twiml.toString();
    logger.info(`📤 Sending TwiML response:`, twimlResponse);
    res.send(twimlResponse);
    
  } catch (error) {
    logger.error('❌ Error handling incoming call:', error);
    
    // Send error TwiML
    const errorTwiml = new twilio.twiml.VoiceResponse();
    errorTwiml.say('We apologize, but there was an error. Please try again later.');
    errorTwiml.hangup();
    
    res.type('text/xml');
    res.status(500).send(errorTwiml.toString());
  }
}

/**
 * FR-03: Real-Time Voice Stream Handler
 * Manages WebSocket connection for bidirectional audio streaming
 */
function handleMediaStream(ws, req) {
  let sessionId = null;
  let callSid = null;
  let streamSid = null;
  let conversationMemory = null;
  let audioBuffer = [];
  let isProcessing = false;

  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message);
      
      switch (msg.event) {
        case 'start':
          sessionId = uuidv4();
          callSid = msg.start.callSid;
          streamSid = msg.start.streamSid;
          
          // Initialize conversation memory for this session
          conversationMemory = new ConversationMemory(sessionId);
          activeSessions.set(sessionId, {
            callSid,
            streamSid,
            conversationMemory,
            startTime: Date.now()
          });
          
          logger.info(`🎙️ Stream started: ${streamSid} for call ${callSid}`);
          break;
          
        case 'media':
          // Receive audio data from caller
          const audioPayload = msg.media.payload; // Base64 encoded mulaw audio
          audioBuffer.push(audioPayload);
          
          // Process audio in chunks to reduce latency
          if (audioBuffer.length >= 20 && !isProcessing) { // ~400ms of audio
            isProcessing = true;
            await processAudioChunk(
              ws,
              audioBuffer.join(''),
              conversationMemory,
              streamSid
            );
            audioBuffer = [];
            isProcessing = false;
          }
          break;
          
        case 'stop':
          logger.info(`🛑 Stream stopped: ${streamSid}`);
          if (sessionId) {
            activeSessions.delete(sessionId);
          }
          break;
          
        default:
          logger.debug(`Unknown event: ${msg.event}`);
      }
    } catch (error) {
      logger.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket connection closed');
    if (sessionId) {
      activeSessions.delete(sessionId);
    }
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });
}

/**
 * Core conversation loop: STT → LLM → TTS
 */
async function processAudioChunk(ws, audioData, conversationMemory, streamSid) {
  const startTime = Date.now();
  
  try {
    // CR-01: Speech-to-Text
    logger.debug('🎤 Transcribing audio...');
    const transcription = await transcribeAudio(audioData);
    
    if (!transcription || transcription.trim().length === 0) {
      return; // Ignore empty or silence
    }
    
    logger.info(`👤 User said: "${transcription}"`);
    
    // Check for call transfer trigger (FR-04)
    if (shouldTransferCall(transcription)) {
      await transferToHumanAgent(ws, streamSid);
      return;
    }
    
    // CR-04: Add user message to conversation memory
    conversationMemory.addMessage('user', transcription);
    
    // CR-02: Get LLM response with conversation context
    logger.debug('🤖 Getting AI response...');
    const llmResponse = await getLLMResponse(
      transcription,
      conversationMemory.getHistory()
    );
    
    // Handle tool calls if present
    let finalResponse = llmResponse.content;
    if (llmResponse.toolCalls && llmResponse.toolCalls.length > 0) {
      logger.info(`🔧 Executing ${llmResponse.toolCalls.length} tool call(s)...`);
      
      for (const toolCall of llmResponse.toolCalls) {
        const toolResult = await executeTool(
          toolCall.name,
          toolCall.arguments
        );
        
        // Get follow-up response from LLM with tool results
        const followUp = await getLLMResponse(
          `Tool "${toolCall.name}" returned: ${JSON.stringify(toolResult)}`,
          conversationMemory.getHistory(),
          true // Mark as tool result
        );
        
        finalResponse = followUp.content;
      }
    }
    
    logger.info(`🤖 AI response: "${finalResponse}"`);
    
    // CR-04: Add assistant message to memory
    conversationMemory.addMessage('assistant', finalResponse);
    
    // CR-05: Text-to-Speech
    logger.debug('🔊 Generating speech...');
    const audioResponse = await generateSpeech(finalResponse);
    
    // Send audio back to Twilio
    sendAudioToTwilio(ws, audioResponse, streamSid);
    
    // Log performance metrics
    const totalTime = Date.now() - startTime;
    logger.info(`⏱️ Total processing time: ${totalTime}ms`);
    
    if (totalTime > 500) {
      logger.warn(`⚠️ Latency exceeds target (500ms): ${totalTime}ms`);
    }
    
  } catch (error) {
    logger.error('Error processing audio chunk:', error);
    
    // Send error message to user
    const errorAudio = await generateSpeech(
      "I apologize, I'm having trouble processing your request. Could you please repeat that?"
    );
    sendAudioToTwilio(ws, errorAudio, streamSid);
  }
}

/**
 * FR-04: Call Transfer Decision Logic
 */
function shouldTransferCall(transcription) {
  const transferPhrases = [
    'speak to agent',
    'talk to human',
    'human agent',
    'real person',
    'speak to someone',
    'transfer me',
    'customer service'
  ];
  
  const lowerTranscript = transcription.toLowerCase();
  return transferPhrases.some(phrase => lowerTranscript.includes(phrase));
}

/**
 * FR-04: Transfer call to human agent
 */
async function transferToHumanAgent(ws, streamSid) {
  logger.info('📞 Transferring call to human agent...');
  
  const transferMessage = await generateSpeech(
    "I'll transfer you to a human agent right away. Please hold."
  );
  
  sendAudioToTwilio(ws, transferMessage, streamSid);
  
  // Send TwiML to transfer the call
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Connecting you now.');
  twiml.dial(process.env.FALLBACK_AGENT_NUMBER);
  
  // Note: In a real implementation, you'd need to end the current stream
  // and execute the dial through Twilio's REST API
}

/**
 * Send audio data back to Twilio via WebSocket
 */
function sendAudioToTwilio(ws, audioData, streamSid) {
  if (!ws || ws.readyState !== ws.OPEN) {
    logger.error('WebSocket is not open, cannot send audio');
    return;
  }
  
  // Twilio expects base64 encoded mulaw audio in specific format
  const mediaMessage = {
    event: 'media',
    streamSid: streamSid,
    media: {
      payload: audioData // Should be base64 encoded mulaw
    }
  };
  
  ws.send(JSON.stringify(mediaMessage));
  
  // Send mark event to track when audio finishes playing
  const markMessage = {
    event: 'mark',
    streamSid: streamSid,
    mark: {
      name: 'audio_complete'
    }
  };
  
  ws.send(JSON.stringify(markMessage));
}

// Export active sessions for monitoring
function getActiveSessions() {
  return Array.from(activeSessions.values()).map(session => ({
    callSid: session.callSid,
    streamSid: session.streamSid,
    duration: Date.now() - session.startTime,
    messageCount: session.conversationMemory.getHistory().length
  }));
}

module.exports = {
  handleIncomingCall,
  handleMediaStream,
  getActiveSessions
};
