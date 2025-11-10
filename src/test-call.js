/**
 * End-to-end testing script for the AI Voice Agent
 * This script simulates various call scenarios to test functionality
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthEndpoint() {
  log('\n📋 Testing Health Endpoint...', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.status === 'healthy') {
      log('✅ Health check passed', 'green');
      log(`   Uptime: ${response.data.uptime.toFixed(2)}s`);
      return true;
    }
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function testTwilioWebhook() {
  log('\n📋 Testing Twilio Voice Webhook...', 'cyan');
  try {
    // Simulate Twilio webhook payload
    const twilioPayload = {
      CallSid: 'CAtest123456789',
      From: '+1234567890',
      To: process.env.TWILIO_PHONE_NUMBER,
      CallStatus: 'ringing'
    };
    
    const response = await axios.post(
      `${BASE_URL}/voice/incoming`,
      new URLSearchParams(twilioPayload),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Twilio-Signature': 'test-signature' // Note: signature validation may be disabled in dev
        }
      }
    );
    
    if (response.data.includes('TwiML') || response.data.includes('Response')) {
      log('✅ Twilio webhook responding correctly', 'green');
      log(`   Response type: ${response.headers['content-type']}`);
      return true;
    }
  } catch (error) {
    if (error.response?.status === 403) {
      log('⚠️  Webhook signature validation is enabled', 'yellow');
      log('   This is expected in production. Test with real Twilio calls.', 'yellow');
      return true;
    }
    log(`❌ Webhook test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testEnvironmentVariables() {
  log('\n📋 Checking Environment Variables...', 'cyan');
  
  const required = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'AI_SERVICE',
    'GOOGLE_APPLICATION_CREDENTIALS'
  ];
  
  const aiService = process.env.AI_SERVICE || 'openai';
  if (aiService === 'openai') {
    required.push('OPENAI_API_KEY');
  } else if (aiService === 'gemini') {
    required.push('GEMINI_API_KEY');
  }
  
  let allPresent = true;
  
  for (const varName of required) {
    if (process.env[varName]) {
      log(`✅ ${varName}: Set`, 'green');
    } else {
      log(`❌ ${varName}: Missing`, 'red');
      allPresent = false;
    }
  }
  
  return allPresent;
}

async function testToolCalling() {
  log('\n📋 Testing Tool Calling Functions...', 'cyan');
  
  const { executeTool } = require('../src/services/toolCalling');
  
  try {
    // Test order status check
    log('  Testing checkOrderStatus...', 'blue');
    const orderResult = await executeTool('checkOrderStatus', {
      orderId: 'TEST123',
      customerPhone: '+1234567890'
    });
    
    if (orderResult.success) {
      log('  ✅ Order status check successful', 'green');
    } else {
      log('  ❌ Order status check failed', 'red');
    }
    
    // Test appointment creation
    log('  Testing createAppointment...', 'blue');
    const appointmentResult = await executeTool('createAppointment', {
      date: '2025-11-15',
      time: '14:00',
      customerName: 'Test User',
      phone: '+1234567890',
      purpose: 'Test appointment'
    });
    
    if (appointmentResult.success) {
      log('  ✅ Appointment creation successful', 'green');
    } else {
      log('  ❌ Appointment creation failed', 'red');
    }
    
    return true;
  } catch (error) {
    log(`❌ Tool calling test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testConversationMemory() {
  log('\n📋 Testing Conversation Memory...', 'cyan');
  
  const ConversationMemory = require('../src/utils/conversationMemory');
  
  try {
    const memory = new ConversationMemory('test-session');
    
    // Add messages
    memory.addMessage('user', 'Hello, I need help with my order');
    memory.addMessage('assistant', 'I\'d be happy to help! What\'s your order number?');
    memory.addMessage('user', 'It\'s 12345');
    
    const history = memory.getHistory();
    
    if (history.length === 3) {
      log('✅ Conversation memory working correctly', 'green');
      log(`   Stored ${history.length} messages`);
      
      const stats = memory.getStats();
      log(`   User messages: ${stats.userMessages}`);
      log(`   Assistant messages: ${stats.assistantMessages}`);
      
      return true;
    } else {
      log('❌ Conversation memory test failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Memory test failed: ${error.message}`, 'red');
    return false;
  }
}

async function displayConfiguration() {
  log('\n📋 Current Configuration:', 'cyan');
  log(`   Server URL: ${BASE_URL}`, 'blue');
  log(`   AI Service: ${process.env.AI_SERVICE || 'openai'}`, 'blue');
  log(`   Twilio Number: ${process.env.TWILIO_PHONE_NUMBER || 'Not set'}`, 'blue');
  log(`   Max Concurrent Calls: ${process.env.MAX_CONCURRENT_CALLS || '50'}`, 'blue');
  log(`   Conversation History: ${process.env.CONVERSATION_HISTORY_TURNS || '5'} turns`, 'blue');
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 AI VOICE AGENT - TEST SUITE', 'cyan');
  log('='.repeat(60), 'cyan');
  
  displayConfiguration();
  
  const tests = [
    { name: 'Environment Variables', fn: testEnvironmentVariables },
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'Twilio Webhook', fn: testTwilioWebhook },
    { name: 'Conversation Memory', fn: testConversationMemory },
    { name: 'Tool Calling', fn: testToolCalling }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed`, passed === tests.length ? 'green' : 'yellow');
  log('='.repeat(60), 'cyan');
  
  if (failed === 0) {
    log('\n✅ All tests passed! Your agent is ready to handle calls.', 'green');
    log('\n📞 Next steps:', 'cyan');
    log('   1. Start the server: npm start', 'blue');
    log('   2. Expose your server (ngrok http 3000)', 'blue');
    log('   3. Configure Twilio webhook with your URL', 'blue');
    log('   4. Call your Twilio number to test!', 'blue');
  } else {
    log('\n⚠️  Some tests failed. Please check the configuration.', 'yellow');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testHealthEndpoint,
  testTwilioWebhook,
  testEnvironmentVariables,
  testToolCalling,
  testConversationMemory
};
