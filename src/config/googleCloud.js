const logger = require('../utils/logger');

/**
 * Initialize Google Cloud credentials from environment
 * Supports both file path and JSON string in environment variable
 */
function getGoogleCredentials() {
  try {
    // Option 1: GOOGLE_CREDENTIALS as JSON string (Railway/Heroku/Production)
    if (process.env.GOOGLE_CREDENTIALS) {
      logger.info('Loading Google credentials from GOOGLE_CREDENTIALS environment variable');
      
      try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        return {
          credentials: credentials,
          projectId: credentials.project_id || process.env.GOOGLE_PROJECT_ID
        };
      } catch (parseError) {
        logger.error('Failed to parse GOOGLE_CREDENTIALS:', parseError.message);
        throw new Error('GOOGLE_CREDENTIALS is not valid JSON');
      }
    }
    
    // Option 2: GOOGLE_APPLICATION_CREDENTIALS as file path (local development)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      logger.info('Loading Google credentials from file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
      return {
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.GOOGLE_PROJECT_ID
      };
    }
    
    // No credentials found - this is OK for testing without speech features
    logger.warn('No Google Cloud credentials configured. Speech features will use mock data.');
    return null;
    
  } catch (error) {
    logger.error('Error loading Google credentials:', error);
    throw error;
  }
}

module.exports = {
  getGoogleCredentials
};
