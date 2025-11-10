/**
 * Interactive setup wizard for AI Voice Agent
 * Helps configure environment variables and test connections
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
  });
}

async function setupWizard() {
  log('\n' + '='.repeat(60), 'bright');
  log('🎙️  AI VOICE AGENT - SETUP WIZARD', 'bright');
  log('='.repeat(60), 'bright');
  
  log('\nThis wizard will help you configure your AI Voice Agent.', 'cyan');
  log('Press Ctrl+C at any time to exit.\n');
  
  const config = {};
  
  // Basic Configuration
  log('\n📋 BASIC CONFIGURATION', 'yellow');
  log('-'.repeat(60));
  
  config.PORT = await question('Server port (default: 3000): ') || '3000';
  config.NODE_ENV = await question('Environment (development/production): ') || 'development';
  
  // Twilio Configuration
  log('\n📞 TWILIO CONFIGURATION', 'yellow');
  log('-'.repeat(60));
  log('Get these from: https://console.twilio.com/\n', 'blue');
  
  config.TWILIO_ACCOUNT_SID = await question('Twilio Account SID: ');
  config.TWILIO_AUTH_TOKEN = await question('Twilio Auth Token: ');
  config.TWILIO_PHONE_NUMBER = await question('Twilio Phone Number (e.g., +1234567890): ');
  config.FALLBACK_AGENT_NUMBER = await question('Fallback Agent Number (optional): ') || '+1234567890';
  
  // AI Service Selection
  log('\n🤖 AI SERVICE CONFIGURATION', 'yellow');
  log('-'.repeat(60));
  log('Choose your AI service:', 'blue');
  log('1. OpenAI (GPT-4, GPT-3.5)');
  log('2. Google Gemini\n');
  
  const aiChoice = await question('Enter choice (1 or 2): ');
  
  if (aiChoice === '1') {
    config.AI_SERVICE = 'openai';
    log('\nGet your API key from: https://platform.openai.com/api-keys\n', 'blue');
    config.OPENAI_API_KEY = await question('OpenAI API Key: ');
    config.OPENAI_MODEL = await question('Model (default: gpt-4-turbo-preview): ') || 'gpt-4-turbo-preview';
  } else {
    config.AI_SERVICE = 'gemini';
    log('\nGet your API key from: https://makersuite.google.com/app/apikey\n', 'blue');
    config.GEMINI_API_KEY = await question('Gemini API Key: ');
    config.GEMINI_MODEL = await question('Model (default: gemini-pro): ') || 'gemini-pro';
  }
  
  // Google Cloud Configuration
  log('\n☁️  GOOGLE CLOUD CONFIGURATION', 'yellow');
  log('-'.repeat(60));
  log('For Speech-to-Text and Text-to-Speech', 'blue');
  log('Get credentials from: https://console.cloud.google.com/\n', 'blue');
  
  config.GOOGLE_PROJECT_ID = await question('Google Cloud Project ID: ');
  config.GOOGLE_APPLICATION_CREDENTIALS = await question('Path to credentials JSON (default: ./google-credentials.json): ') || './google-credentials.json';
  
  // Speech Configuration
  log('\n🎤 SPEECH CONFIGURATION', 'yellow');
  log('-'.repeat(60));
  
  config.STT_LANGUAGE_CODE = await question('Speech-to-Text language (default: en-US): ') || 'en-US';
  config.TTS_LANGUAGE_CODE = await question('Text-to-Speech language (default: en-US): ') || 'en-US';
  config.TTS_VOICE_NAME = await question('TTS Voice name (default: en-US-Neural2-F): ') || 'en-US-Neural2-F';
  
  // Performance Settings
  log('\n⚡ PERFORMANCE SETTINGS', 'yellow');
  log('-'.repeat(60));
  
  config.MAX_CONCURRENT_CALLS = await question('Max concurrent calls (default: 50): ') || '50';
  config.CONVERSATION_HISTORY_TURNS = await question('Conversation history turns (default: 5): ') || '5';
  config.RESPONSE_TIMEOUT_MS = await question('Response timeout in ms (default: 5000): ') || '5000';
  
  // External Tools (Optional)
  log('\n🔧 EXTERNAL TOOLS (Optional)', 'yellow');
  log('-'.repeat(60));
  log('Press Enter to skip if not using\n', 'blue');
  
  config.DATABASE_API_URL = await question('Database API URL (optional): ') || '';
  config.CALENDAR_API_URL = await question('Calendar API URL (optional): ') || 'https://www.googleapis.com/calendar/v3';
  config.GOOGLE_CALENDAR_API_KEY = await question('Google Calendar API Key (optional): ') || '';
  
  // Write .env file
  log('\n💾 SAVING CONFIGURATION', 'yellow');
  log('-'.repeat(60));
  
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);
  
  log(`✅ Configuration saved to ${envPath}`, 'green');
  
  // Summary
  log('\n📊 CONFIGURATION SUMMARY', 'yellow');
  log('-'.repeat(60));
  log(`AI Service: ${config.AI_SERVICE}`, 'blue');
  log(`Twilio Number: ${config.TWILIO_PHONE_NUMBER}`, 'blue');
  log(`Server Port: ${config.PORT}`, 'blue');
  log(`Max Concurrent Calls: ${config.MAX_CONCURRENT_CALLS}`, 'blue');
  
  // Next Steps
  log('\n🚀 NEXT STEPS', 'yellow');
  log('-'.repeat(60));
  log('1. Ensure google-credentials.json is in the project root', 'green');
  log('2. Install dependencies: npm install', 'green');
  log('3. Start the server: npm start', 'green');
  log('4. Expose your server (for local testing): npx ngrok http ' + config.PORT, 'green');
  log('5. Configure Twilio webhook with your public URL', 'green');
  log('6. Test by calling your Twilio number!', 'green');
  
  log('\n📚 DOCUMENTATION', 'yellow');
  log('-'.repeat(60));
  log('- README.md: General setup and usage', 'blue');
  log('- DEPLOYMENT.md: Deployment guides', 'blue');
  log('- TROUBLESHOOTING.md: Common issues and solutions', 'blue');
  
  log('\n✨ Setup complete! Good luck with your AI Voice Agent!\n', 'green');
  
  rl.close();
}

// Run the wizard
setupWizard().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
