const textToSpeech = require('@google-cloud/text-to-speech');
const logger = require('../utils/logger');

// Initialize Google Cloud Text-to-Speech client
const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_PROJECT_ID
});

// Cache for frequently used phrases to reduce latency
const audioCache = new Map();
const MAX_CACHE_SIZE = 100;

/**
 * CR-05: Text-to-Speech
 * Convert text to speech using Google Cloud Text-to-Speech
 * 
 * @param {string} text - Text to convert to speech
 * @returns {Promise<string>} - Base64 encoded audio (mulaw format for Twilio)
 */
async function generateSpeech(text) {
  try {
    // Check cache first
    if (audioCache.has(text)) {
      logger.debug('Using cached TTS audio');
      return audioCache.get(text);
    }
    
    // Configure synthesis request
    const request = {
      input: { text: text },
      voice: {
        languageCode: process.env.TTS_LANGUAGE_CODE || 'en-US',
        name: process.env.TTS_VOICE_NAME || 'en-US-Neural2-F', // Female neural voice
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MULAW', // Match Twilio's expected format
        sampleRateHertz: 8000, // Phone quality
        speakingRate: 1.0, // Normal speed
        pitch: 0.0, // Normal pitch
        volumeGainDb: 0.0 // Normal volume
      }
    };
    
    // Perform text-to-speech synthesis
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    // Convert to base64
    const audioContent = response.audioContent.toString('base64');
    
    // Cache the result if cache isn't full
    if (audioCache.size < MAX_CACHE_SIZE) {
      audioCache.set(text, audioContent);
    }
    
    return audioContent;
    
  } catch (error) {
    logger.error('Text-to-Speech error:', error);
    throw new Error('Failed to generate speech');
  }
}

/**
 * Generate speech with custom voice settings
 */
async function generateSpeechCustom(text, options = {}) {
  const {
    voiceName = process.env.TTS_VOICE_NAME,
    languageCode = process.env.TTS_LANGUAGE_CODE,
    speakingRate = 1.0,
    pitch = 0.0,
    volumeGainDb = 0.0
  } = options;
  
  try {
    const request = {
      input: { text: text },
      voice: {
        languageCode: languageCode,
        name: voiceName
      },
      audioConfig: {
        audioEncoding: 'MULAW',
        sampleRateHertz: 8000,
        speakingRate: speakingRate,
        pitch: pitch,
        volumeGainDb: volumeGainDb
      }
    };
    
    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent.toString('base64');
    
  } catch (error) {
    logger.error('Custom TTS error:', error);
    throw new Error('Failed to generate custom speech');
  }
}

/**
 * Generate speech with SSML for advanced control
 * Useful for emphasizing words, adding pauses, etc.
 */
async function generateSpeechSSML(ssml) {
  try {
    const request = {
      input: { ssml: ssml },
      voice: {
        languageCode: process.env.TTS_LANGUAGE_CODE || 'en-US',
        name: process.env.TTS_VOICE_NAME || 'en-US-Neural2-F'
      },
      audioConfig: {
        audioEncoding: 'MULAW',
        sampleRateHertz: 8000
      }
    };
    
    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent.toString('base64');
    
  } catch (error) {
    logger.error('SSML TTS error:', error);
    throw new Error('Failed to generate SSML speech');
  }
}

/**
 * Clear the audio cache
 */
function clearCache() {
  audioCache.clear();
  logger.info('TTS cache cleared');
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: audioCache.size,
    maxSize: MAX_CACHE_SIZE,
    entries: Array.from(audioCache.keys())
  };
}

module.exports = {
  generateSpeech,
  generateSpeechCustom,
  generateSpeechSSML,
  clearCache,
  getCacheStats
};
