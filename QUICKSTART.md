# 🚀 Quick Start Guide

Get your AI Voice Agent running in under 10 minutes!

## Prerequisites Checklist

- [ ] Node.js 16+ installed
- [ ] Twilio account with phone number
- [ ] OpenAI API key OR Google Gemini API key
- [ ] Google Cloud account (for STT/TTS)

## 5-Step Setup

### Step 1: Install Dependencies (2 min)

```powershell
cd c:\Users\vamsi\Desktop\voice-agent
npm install
```

### Step 2: Run Setup Wizard (3 min)

```powershell
npm run setup
```

The wizard will ask you for:
- Twilio credentials
- AI service choice (OpenAI/Gemini)
- Google Cloud project ID
- Speech settings

### Step 3: Add Google Credentials (1 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create service account → Download JSON key
3. Save as `google-credentials.json` in project root

### Step 4: Start Server (1 min)

```powershell
npm start
```

You should see:
```
🚀 AI Voice Agent server running on port 3000
📞 Webhook URL: http://localhost:3000/voice/incoming
```

### Step 5: Configure Twilio (3 min)

#### For Local Testing:

```powershell
# In a new terminal, run ngrok
npx ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

#### Configure Twilio:

1. Go to [Twilio Console](https://console.twilio.com/)
2. Phone Numbers → Your Number
3. Under "Voice Configuration":
   - A CALL COMES IN: Webhook
   - URL: `https://your-ngrok-url.com/voice/incoming`
   - HTTP: POST
4. Save

## 🎉 Test Your Agent!

Call your Twilio number and say:

- "Hello" → AI will greet you
- "What's my order status?" → AI will use tool to check
- "Schedule an appointment" → AI will create calendar entry
- "Speak to a human" → Call transfers to agent

## 📊 Monitor Your Agent

While the server is running, visit:

- Health: `http://localhost:3000/health`
- Status: `http://localhost:3000/api/status`
- Sessions: `http://localhost:3000/api/sessions`

## 🐛 Something Not Working?

Run the test suite:
```powershell
npm test
```

Check logs for errors. Common issues:

| Error | Fix |
|-------|-----|
| "Failed to transcribe" | Check Google credentials |
| "OpenAI API error" | Verify API key is correct |
| "Webhook 403" | Disable signature validation in dev |
| "High latency" | Use smaller LLM model |

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## 🚢 Ready to Deploy?

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guides:
- Heroku (easiest)
- AWS EC2 (most control)
- Google Cloud Run (serverless)
- Railway (developer-friendly)

## 📞 Example Conversations

**Scenario 1: Order Status**
```
User: "Hi, where's my order?"
AI: "I'd be happy to help! Could you provide your order number?"
User: "It's 12345"
AI: "Let me check that for you... Your order 12345 is currently 
     shipped and should arrive by November 15th."
```

**Scenario 2: Schedule Appointment**
```
User: "I need to schedule an appointment"
AI: "I can help with that! What date works best for you?"
User: "Next Tuesday at 2 PM"
AI: "Perfect! I've scheduled your appointment for Tuesday, 
     November 14th at 2:00 PM. Your confirmation number is APT123."
```

**Scenario 3: Transfer to Human**
```
User: "This is frustrating, let me talk to a person"
AI: "I understand. I'll transfer you to one of our agents 
     right away. Please hold."
[Call transfers]
```

## 🎨 Customize Your Agent

### Change AI Personality

Edit `src/config/systemPrompt.js`:
```javascript
const SYSTEM_PROMPT = `You are Sarah, a friendly tech support agent...`;
```

### Add Custom Tools

Edit `src/config/tools.json` and `src/services/toolCalling.js`

### Change Voice

Edit `.env`:
```env
TTS_VOICE_NAME=en-US-Neural2-D  # Male voice
# or
TTS_VOICE_NAME=en-US-Neural2-J  # Different male voice
```

Available voices: A, C, D, F, G, H, I, J

## 📚 Learn More

- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [PRD-CHECKLIST.md](PRD-CHECKLIST.md) - Implementation details

## 💡 Pro Tips

1. **Lower Latency**: Use `gpt-3.5-turbo` instead of `gpt-4`
2. **Save Money**: Enable TTS caching (already implemented!)
3. **Better Audio**: Use Neural2 voices (higher quality)
4. **Debug**: Set `LOG_LEVEL=DEBUG` in `.env`
5. **Scale**: Deploy to Cloud Run for auto-scaling

## 🆘 Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Run tests: `npm test`
3. Check logs: `npm run dev` (shows all debug info)
4. Review PRD implementation: [PRD-CHECKLIST.md](PRD-CHECKLIST.md)

---

**You're all set! 🎉 Happy building!**
