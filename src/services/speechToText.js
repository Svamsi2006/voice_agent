const speech = require('@google-cloud/speech');
const logger = require('../utils/logger');
const { getGoogleCredentials } = require('../config/googleCloud');

let speechClient;

try {
  const credentials = getGoogleCredentials();
  
  if (!credentials) {
    logger.warn('Google Speech-to-Text not initialized - using mock mode');
    speechClient = null;
  } else {
    logger.info('Initializing Google Speech-to-Text client');
    speechClient = new speech.SpeechClient(credentials);
  }
} catch (error) {
  logger.error('Failed to initialize Speech-to-Text client:', error);
  speechClient = null;
}

/**
 * CR-01: Speech-to-Text
 * Transcribe audio data to text using Google Cloud Speech-to-Text
 * 
 * @param {string} audioData - Base64 encoded audio (mulaw format from Twilio)
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioBuffer) {
  // Mock response if client not initialized
  if (!speechClient) {
    logger.warn('Speech-to-Text client not available - returning mock transcription');
    return 'Mock transcription - Google credentials not configured';
  }
  
  try {
    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: 'MULAW',
      sampleRateHertz: 8000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      model: 'phone_call',
    };

    const request = {
      audio: audio,
      config: config,
    };

    logger.debug('Sending audio to Google Speech-to-Text API');
    const [response] = await speechClient.recognize(request);
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    logger.info('Transcription successful:', transcription);
    return transcription;

  } catch (error) {
    logger.error('Speech-to-Text error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Streaming STT for real-time transcription (alternative approach)
 * This can be used for even lower latency
 */
class StreamingSTT {
  constructor() {
    this.recognizeStream = null;
    this.transcript = '';
  }
  
  start(onTranscript, onError) {
    const request = {
      config: {
        encoding: 'MULAW',
        sampleRateHertz: 8000,
        languageCode: process.env.STT_LANGUAGE_CODE || 'en-US',
        enableAutomaticPunctuation: true,
        model: 'phone_call',
        useEnhanced: true
      },
      interimResults: true // Get partial results for faster response
    };
    
    this.recognizeStream = speechClient
      .streamingRecognize(request)
      .on('error', (error) => {
        logger.error('Streaming STT error:', error);
        if (onError) onError(error);
      })
      .on('data', (data) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          const result = data.results[0].alternatives[0];
          this.transcript = result.transcript;
          
          // Check if this is a final result
          if (data.results[0].isFinal) {
            logger.debug(`STT Final: "${this.transcript}"`);
            if (onTranscript) onTranscript(this.transcript, true);
            this.transcript = '';
          } else {
            logger.debug(`STT Interim: "${this.transcript}"`);
            if (onTranscript) onTranscript(this.transcript, false);
          }
        }
      });
    
    return this.recognizeStream;
  }
  
  write(audioData) {
    if (this.recognizeStream) {
      const audioBuffer = Buffer.from(audioData, 'base64');
      this.recognizeStream.write(audioBuffer);
    }
  }
  
  stop() {
    if (this.recognizeStream) {
      this.recognizeStream.end();
      this.recognizeStream = null;
    }
  }
}

module.exports = {
  transcribeAudio,
  StreamingSTT,
  speechClient
};
