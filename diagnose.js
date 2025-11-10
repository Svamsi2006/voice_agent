/**
 * Railway Deployment Diagnostic Script
 * Run this to check if all required environment variables are set
 */

console.log('🔍 Railway Environment Diagnostic\n');
console.log('=================================\n');

const required = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN', 
  'TWILIO_PHONE_NUMBER',
  'GEMINI_API_KEY',
  'GOOGLE_PROJECT_ID',
  'AI_SERVICE'
];

const optional = [
  'GOOGLE_CREDENTIALS',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'OPENAI_API_KEY',
  'NODE_ENV',
  'PORT',
  'STT_LANGUAGE_CODE',
  'TTS_LANGUAGE_CODE',
  'TTS_VOICE_NAME'
];

console.log('✅ Required Variables:');
let missingRequired = 0;
required.forEach(key => {
  const exists = !!process.env[key];
  const status = exists ? '✓' : '✗';
  const value = exists ? `${process.env[key].substring(0, 10)}...` : 'MISSING';
  console.log(`  ${status} ${key}: ${value}`);
  if (!exists) missingRequired++;
});

console.log('\n📋 Optional Variables:');
optional.forEach(key => {
  const exists = !!process.env[key];
  const status = exists ? '✓' : '○';
  const value = exists ? `${process.env[key].substring(0, 10)}...` : 'not set';
  console.log(`  ${status} ${key}: ${value}`);
});

console.log('\n🔧 Google Credentials Check:');
if (process.env.GOOGLE_CREDENTIALS) {
  try {
    const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log('  ✓ GOOGLE_CREDENTIALS: Valid JSON');
    console.log(`    - project_id: ${creds.project_id || 'MISSING'}`);
    console.log(`    - client_email: ${creds.client_email || 'MISSING'}`);
    console.log(`    - private_key: ${creds.private_key ? 'Present' : 'MISSING'}`);
  } catch (e) {
    console.log('  ✗ GOOGLE_CREDENTIALS: Invalid JSON!');
    console.log(`    Error: ${e.message}`);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log(`  ✓ GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
} else {
  console.log('  ⚠ No Google credentials found (STT/TTS will use mock mode)');
}

console.log('\n📊 Summary:');
if (missingRequired > 0) {
  console.log(`  ❌ ${missingRequired} required variables missing!`);
  process.exit(1);
} else {
  console.log('  ✅ All required variables present');
}

console.log('\n🚀 Starting server...\n');
console.log('=================================\n');

// Now start the actual server
require('./src/server.js');
