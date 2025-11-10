# Troubleshooting Guide

## Common Issues and Solutions

### 1. Server Won't Start

**Symptom**: Server crashes immediately or won't bind to port

**Possible Causes**:
- Missing environment variables
- Port already in use
- Missing dependencies

**Solutions**:
```powershell
# Check if port is in use
netstat -ano | findstr :3000

# Kill process using the port (if needed)
taskkill /PID <PID> /F

# Reinstall dependencies
rm -r node_modules
npm install

# Check environment variables
cat .env
```

---

### 2. Twilio Webhook Not Working

**Symptom**: Calls go to voicemail or get "number not in service" message

**Possible Causes**:
- Webhook URL not configured
- Server not publicly accessible
- Webhook signature validation failing

**Solutions**:
```powershell
# Test webhook locally with ngrok
ngrok http 3000

# Test the endpoint
curl http://localhost:3000/health

# Check Twilio configuration
# Go to: https://console.twilio.com/
# Phone Numbers → Active Numbers → Your Number
# Verify webhook URL is set to: https://your-domain.com/voice/incoming
```

**Disable signature validation for testing**:
```env
NODE_ENV=development
VALIDATE_TWILIO_SIGNATURE=false
```

---

### 3. High Latency (>500ms)

**Symptom**: Long pauses during conversation

**Diagnostic Steps**:
```javascript
// Check logs for timing information
// Look for: "⏱️ Total processing time: XXXms"
```

**Common Causes & Fixes**:

| Cause | Solution |
|-------|----------|
| Slow STT | Use streaming STT instead of batch |
| Slow LLM | Switch to smaller model or enable streaming |
| Slow TTS | Enable caching for common phrases |
| Network issues | Check API endpoint latency |

**Optimization Configuration**:
```env
# Use faster models
OPENAI_MODEL=gpt-3.5-turbo  # Instead of gpt-4
STT_MODEL=default  # Instead of "enhanced"

# Enable streaming
USE_STREAMING=true
```

---

### 4. Audio Quality Issues

**Symptom**: Robotic voice, choppy audio, or no audio

**Checks**:
```javascript
// Verify audio encoding
// Check logs for: "Audio encoding: MULAW, Sample rate: 8000"
```

**Solutions**:

1. **Verify TTS Settings**:
```env
TTS_LANGUAGE_CODE=en-US
TTS_VOICE_NAME=en-US-Neural2-F
```

2. **Test Different Voices**:
```javascript
// Available Google TTS voices for en-US:
// - en-US-Neural2-A (Male)
// - en-US-Neural2-C (Female)
// - en-US-Neural2-D (Male)
// - en-US-Neural2-F (Female)
// - en-US-Neural2-G (Female)
// - en-US-Neural2-H (Female)
// - en-US-Neural2-I (Male)
// - en-US-Neural2-J (Male)
```

3. **Check Audio Format**:
- Twilio expects: mulaw, 8kHz, mono
- Verify in logs that encoding matches

---

### 5. Google Cloud API Errors

**Symptom**: 
- "Failed to transcribe audio"
- "Failed to generate speech"
- Authentication errors

**Solutions**:

1. **Verify Credentials**:
```powershell
# Check if file exists
ls google-credentials.json

# Verify it's valid JSON
cat google-credentials.json | ConvertFrom-Json

# Check environment variable
echo $env:GOOGLE_APPLICATION_CREDENTIALS
```

2. **Enable Required APIs**:
- Go to: https://console.cloud.google.com/apis/library
- Enable:
  - Cloud Speech-to-Text API
  - Cloud Text-to-Speech API

3. **Check Quota**:
- Go to: https://console.cloud.google.com/iam-admin/quotas
- Verify you haven't exceeded limits

4. **Test Credentials**:
```powershell
node -e "const speech = require('@google-cloud/speech'); const client = new speech.SpeechClient(); console.log('Success!');"
```

---

### 6. OpenAI/Gemini API Errors

**Symptom**: "Failed to get AI response" or timeout errors

**Solutions**:

1. **Verify API Key**:
```powershell
# Test OpenAI
curl https://api.openai.com/v1/models -H "Authorization: Bearer $env:OPENAI_API_KEY"

# Check key format
echo $env:OPENAI_API_KEY  # Should start with "sk-"
```

2. **Check Rate Limits**:
- OpenAI: https://platform.openai.com/account/rate-limits
- Monitor usage in logs

3. **Reduce Token Usage**:
```env
# Limit response length
MAX_TOKENS=100  # Instead of 150

# Reduce conversation history
CONVERSATION_HISTORY_TURNS=3  # Instead of 5
```

---

### 7. WebSocket Connection Issues

**Symptom**: "WebSocket connection closed" in logs

**Causes**:
- Network timeout
- Server restart
- Twilio disconnection

**Solutions**:

1. **Increase Timeout**:
```javascript
// In twilioHandler.js
ws.setTimeout(60000); // 60 seconds
```

2. **Add Reconnection Logic**:
```javascript
ws.on('close', () => {
  logger.info('WebSocket closed, cleaning up...');
  // Cleanup logic here
});
```

3. **Check Firewall Rules**:
- Ensure WebSocket traffic is allowed
- Check cloud provider security groups

---

### 8. Memory Leaks

**Symptom**: Server slows down over time, high memory usage

**Diagnostic**:
```javascript
// Add to server.js
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory:', {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB'
  });
}, 30000);
```

**Solutions**:

1. **Clean Old Sessions**:
```javascript
// Add periodic cleanup
setInterval(() => {
  MemoryManager.clearOldSessions(3600000); // 1 hour
}, 600000); // Every 10 minutes
```

2. **Limit Cache Size**:
```javascript
// In textToSpeech.js
const MAX_CACHE_SIZE = 50; // Reduce from 100
```

---

### 9. Tool Calling Not Working

**Symptom**: LLM doesn't use available tools

**Checks**:

1. **Verify Tool Schema**:
```javascript
// Check tools.json format
const tools = require('./src/config/tools.json');
console.log(JSON.stringify(tools, null, 2));
```

2. **Check System Prompt**:
- Ensure system prompt mentions available tools
- Verify tool descriptions are clear

3. **Test Tool Execution**:
```javascript
const { executeTool } = require('./src/services/toolCalling');

executeTool('checkOrderStatus', { orderId: 'TEST123' })
  .then(result => console.log('Success:', result))
  .catch(err => console.error('Error:', err));
```

---

### 10. Call Transfer Not Working

**Symptom**: Transfer request doesn't connect to human agent

**Solutions**:

1. **Verify Agent Number**:
```env
FALLBACK_AGENT_NUMBER=+1234567890  # Must be valid phone number
```

2. **Check Transfer Triggers**:
```javascript
// In twilioHandler.js, verify transfer phrases
const transferPhrases = [
  'speak to agent',
  'talk to human',
  'human agent',
  'real person'
];
```

3. **Test Manually**:
- Call your number
- Say "speak to a human agent"
- Check logs for transfer attempt

---

## Debug Mode

Enable detailed logging:

```env
LOG_LEVEL=DEBUG
NODE_ENV=development
```

This will show:
- All API calls
- Audio processing steps
- Conversation history
- Timing information

---

## Getting Help

1. **Check Logs First**:
   - Look for error messages
   - Check timing information
   - Verify all services are responding

2. **Test Individual Components**:
   ```powershell
   npm test  # Run test suite
   ```

3. **Verify Configuration**:
   ```javascript
   node -e "require('dotenv').config(); console.log(process.env);"
   ```

4. **Monitor in Real-Time**:
   ```powershell
   # Watch logs while making a test call
   npm run dev
   ```

5. **Contact Support**:
   - Twilio: https://support.twilio.com
   - OpenAI: https://help.openai.com
   - Google Cloud: https://cloud.google.com/support

---

## Performance Benchmarks

**Expected Latencies**:
- STT: 100-200ms
- LLM: 200-400ms
- TTS: 100-200ms
- **Total**: 400-800ms (target: <500ms)

If you're consistently exceeding these, investigate the slowest component first.
