const speech = require('@google-cloud/speech');
const logger = require('../utils/logger');

// Initialize Google Cloud Speech-to-Text client
const speechClient = new speech.SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_PROJECT_ID
});

/**
 * CR-01: Speech-to-Text
 * Transcribe audio data to text using Google Cloud Speech-to-Text
 * 
 * @param {string} audioData - Base64 encoded audio (mulaw format from Twilio)
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioData) {
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    // Configure recognition request
    const request = {
      audio: {
        content: audioBuffer.toString('base64')
      },
      config: {
        encoding: 'MULAW', // Twilio uses mulaw encoding
        sampleRateHertz: 8000, // Twilio phone audio is 8kHz
        languageCode: process.env.STT_LANGUAGE_CODE || 'en-US',
        enableAutomaticPunctuation: true,
        model: 'phone_call', // Optimized for phone audio
        useEnhanced: true // Use enhanced model for better accuracy
      }
    };
    
    // Perform synchronous speech recognition
    const [response] = await speechClient.recognize(request);
    
    if (!response.results || response.results.length === 0) {
      return '';
    }
    
    // Get the first (and typically only) result
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join(' ');
    
    return transcription.trim();
    
  } catch (error) {
    logger.error('Speech-to-Text error:', error);
    throw new Error('Failed to transcribe audio');
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
  StreamingSTT
};
