# Railway Deployment Setup Guide

## Current Status
✅ Code pushed to GitHub: https://github.com/Svamsi2006/voice_agent
✅ Railway connected and auto-deploying
🔄 Waiting for redeploy with credential fixes

## Railway Environment Variables

You MUST add these environment variables in your Railway dashboard:

### 1. Go to Railway Dashboard
- Visit: https://railway.app/dashboard
- Select your `voice-agent` project
- Click on the service
- Go to the "Variables" tab

### 2. Add Required Variables

```bash
# Twilio Credentials
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER

# Google Gemini API
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google Cloud Project
GOOGLE_PROJECT_ID=YOUR_GOOGLE_PROJECT_ID

# AI Service Selection
AI_SERVICE=gemini

# Node Environment
NODE_ENV=production
```

### 3. Add Google Cloud Credentials (CRITICAL)

The Google Cloud credentials need to be added as a **single-line JSON string**:

**Variable Name:** `GOOGLE_CREDENTIALS`

**Variable Value:** Copy your entire Google Cloud service account JSON and **remove all line breaks**. It should look like this:

```json
{"type":"service_account","project_id":"billitup","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"katapa@billitup.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**Important:** 
- Must be valid JSON on a single line
- Keep the `\n` characters in the private_key field
- No extra spaces or line breaks

### 4. Optional Variables (with defaults)

```bash
# Speech Settings
STT_LANGUAGE_CODE=en-US
TTS_LANGUAGE_CODE=en-US
TTS_VOICE_NAME=en-US-Neural2-F

# Server Settings
PORT=3000  # Railway will override this automatically
```

## After Adding Variables

1. **Save** all environment variables in Railway
2. Railway will **automatically redeploy** your app
3. Watch the deployment logs in Railway dashboard
4. Look for these log messages:
   - ✅ "AI Voice Agent server running on 0.0.0.0:XXXX"
   - ✅ "Initializing Google Speech-to-Text client"
   - ✅ "Initializing Google Text-to-Speech client"
   - ✅ "Gemini AI service initialized"

## Your Railway URL

```
https://voiceagent-production-0d23.up.railway.app
```

## Configure Twilio Webhook

Once Railway is running successfully:

1. Go to Twilio Console: https://console.twilio.com
2. Navigate to: **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your Twilio phone number
4. Scroll to "Voice Configuration"
5. Set "A CALL COMES IN" webhook to:
   ```
   https://voiceagent-production-0d23.up.railway.app/voice/incoming
   ```
6. Select **HTTP POST**
7. **Save**

## Test Your Voice Agent

1. Call your Twilio number
2. The AI agent should answer and start talking
3. Have a conversation!

## Troubleshooting

### If Railway still shows "Application failed to respond":

1. **Check Logs** in Railway dashboard:
   - Look for error messages
   - Verify all services initialized
   - Check for missing credentials

2. **Verify Environment Variables:**
   - All required variables are set
   - GOOGLE_CREDENTIALS is valid JSON
   - No typos in variable names

3. **Common Issues:**
   - **Missing GOOGLE_CREDENTIALS**: App will run but STT/TTS will use mock mode
   - **Invalid JSON in GOOGLE_CREDENTIALS**: App will crash on startup
   - **Wrong Twilio credentials**: Webhook validation will fail
   - **Missing GEMINI_API_KEY**: LLM will fail

### Check Health Endpoint

Once deployed, visit:
```
https://voiceagent-production-0d23.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "uptime": 123.45,
  "services": {
    "twilio": "connected",
    "llm": "ready",
    "stt": "ready",
    "tts": "ready"
  }
}
```

## Next Steps

1. ✅ Add all environment variables in Railway (do this now!)
2. ⏳ Wait for Railway to redeploy (~2-3 minutes)
3. ✅ Check deployment logs for success messages
4. ✅ Test health endpoint
5. ✅ Configure Twilio webhook
6. ✅ Make a test call!

## Support

If you encounter issues:
- Check Railway logs first
- Verify all environment variables are set correctly
- Test the health endpoint
- Check Twilio webhook configuration
