# 🎉 YOUR AI VOICE AGENT IS READY!

## ✅ What's Configured

Your AI influencer phone agent is **pre-configured** and ready to go!

### 📞 Your Twilio Number
**YOUR_TWILIO_NUMBER** ← People call this number to talk to your AI agent

### 🤖 Your AI Agent: "Alex"
- **Personality**: Energetic influencer who loves connecting with people
- **Powered by**: Google Gemini (Live conversational AI)
- **Voice**: Natural female voice (Neural2-F)
- **Style**: Warm, authentic, and conversational

---

## 🚀 GET STARTED IN 3 STEPS

### Step 1: Install Dependencies
```powershell
cd c:\Users\vamsi\Desktop\voice-agent
npm install
```

### Step 2: Add Google Cloud Credentials

You need Google Cloud for speech (Speech-to-Text and Text-to-Speech):

1. **Go to**: https://console.cloud.google.com/
2. **Create a project** (or use existing)
3. **Enable APIs**:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
4. **Create Service Account**:
   - Go to: IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name it: "voice-agent-service"
   - Grant roles: "Cloud Speech Client" + "Cloud Text-to-Speech User"
   - Click "Create Key" → Choose JSON
   - Download the JSON file
5. **Save the file** as `google-credentials.json` in your project folder:
   ```
   c:\Users\vamsi\Desktop\voice-agent\google-credentials.json
   ```
6. **Update .env** file with your Google Cloud Project ID:
   - Open `.env` file
   - Find: `GOOGLE_PROJECT_ID=your_google_project_id`
   - Replace with your actual project ID

**💡 Google Cloud offers $300 free credit for new users!**

### Step 3: Start the Server
```powershell
npm start
```

You should see:
```
🚀 AI Voice Agent server running on port 3000
📞 Webhook URL: http://localhost:3000/voice/incoming
🤖 AI Service: gemini
```

---

## 🌐 Make It Accessible (Choose One)

### Option A: Local Testing with ngrok (Recommended)

Open a **new terminal** and run:
```powershell
npx ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

### Option B: Deploy to Cloud (Production)

Choose a platform and follow the guide in `DEPLOYMENT.md`:
- **Railway** ⭐ (Easiest)
- **Heroku** (Popular)
- **Google Cloud Run** (Auto-scaling)
- **AWS EC2** (Full control)

---

## 📞 Configure Twilio Webhook

### Final Step: Connect Twilio to Your Server

1. **Go to**: https://console.twilio.com/
2. **Navigate**: Phone Numbers → Manage → Active Numbers
3. **Click**: Your number (YOUR_TWILIO_NUMBER)
4. **Scroll to**: "Voice Configuration"
5. **Set**:
   - **A CALL COMES IN**: Webhook
   - **URL**: 
     - Local: `https://YOUR-NGROK-URL.ngrok.io/voice/incoming`
     - Production: `https://your-domain.com/voice/incoming`
   - **HTTP Method**: POST
6. **Click**: Save

---

## 🎉 TEST YOUR AGENT!

### Make a Test Call

**Call**: YOUR_TWILIO_NUMBER

**Expected Experience**:
```
📞 [Phone rings]

AI (Alex): "Hey there! This is Alex! How's your day going?"

You: "Hi Alex! I'm doing great!"

AI: "Awesome! I love to hear that! What can I help you with today?"

You: "Can you check my order status?"

AI: "Oh for sure! Let me grab that for you real quick! 
     Do you have your order number?"

You: "It's 12345"

AI: "Perfect! Let me check... Great news! Your order 12345 
     is on its way and should arrive by November 15th!"
```

### Try Different Conversations:

1. **Just Chat**: "Hey, how's it going?"
2. **Order Check**: "Where's my order?"
3. **Schedule**: "I need to book an appointment"
4. **General**: "Tell me about your services"

---

## 🎯 What Your Agent Can Do

### Live Conversations ✨
- Real-time back-and-forth dialogue
- Remembers context (last 5 conversation turns)
- Natural, human-like responses
- Energetic influencer personality

### Smart Actions 🛠️
- ✅ Check order status
- ✅ Look up customer information
- ✅ Schedule appointments
- ✅ Update appointments
- ✅ Answer questions
- ✅ Transfer to human agents (if needed)

### Personality Traits 🌟
- Warm and welcoming
- Genuinely interested
- Upbeat and positive
- Authentic and relatable
- Helpful without being pushy

---

## 📊 Monitor Your Agent

While running, check these URLs:

### System Health
```
http://localhost:3000/health
```

### Active Calls & Statistics
```
http://localhost:3000/api/status
```

### View All Sessions
```
http://localhost:3000/api/sessions
```

---

## 🎨 Customize Your Agent

### Change Voice

Edit `.env` file:
```env
# Current (Female)
TTS_VOICE_NAME=en-US-Neural2-F

# Male Options:
TTS_VOICE_NAME=en-US-Neural2-D  # Male voice
TTS_VOICE_NAME=en-US-Neural2-J  # Another male voice

# More Female Options:
TTS_VOICE_NAME=en-US-Neural2-C
TTS_VOICE_NAME=en-US-Neural2-G
```

### Change Personality

Edit `src/config/systemPrompt.js` to modify Alex's character, tone, and style.

### Add Custom Tools

Edit these files:
- `src/config/tools.json` - Add tool definitions
- `src/services/toolCalling.js` - Implement tool logic

---

## 🐛 Troubleshooting

### "npm install" fails
```powershell
npm cache clean --force
npm install
```

### "Failed to transcribe audio"
➡️ Make sure `google-credentials.json` exists and `GOOGLE_PROJECT_ID` is set in `.env`

### "Gemini API error"
➡️ Your API key is already configured, but verify it's active at https://makersuite.google.com/

### "Twilio webhook fails"
➡️ Ensure ngrok is running and the webhook URL in Twilio includes `/voice/incoming`

### High latency (slow responses)
➡️ First call is slower. Subsequent calls are faster due to caching.

### More Help
Check `TROUBLESHOOTING.md` for detailed solutions.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **QUICK-REF.md** | Quick commands & reference |
| **YOUR-SETUP.md** | Your specific configuration guide |
| **QUICKSTART.md** | 10-minute setup guide |
| **README.md** | Complete documentation |
| **TROUBLESHOOTING.md** | Common issues & fixes |
| **DEPLOYMENT.md** | Production deployment |

---

## 💰 Costs

### Estimated for 100 hours of calls/month:
- Twilio: ~$20-40
- Google Gemini: ~$15-30
- Google Cloud (Speech): ~$15-40
- Hosting: $0-100 (depends on platform)
- **Total**: ~$50-200/month

### Tips to Reduce Costs:
- Use shorter conversation history
- Enable caching (already implemented)
- Set call time limits if needed

---

## ✅ Quick Start Checklist

- [ ] Run `npm install`
- [ ] Create Google Cloud project
- [ ] Enable Speech-to-Text & Text-to-Speech APIs
- [ ] Download service account JSON key
- [ ] Save as `google-credentials.json`
- [ ] Update `GOOGLE_PROJECT_ID` in `.env`
- [ ] Run `npm start`
- [ ] Run `npx ngrok http 3000` (new terminal)
- [ ] Configure Twilio webhook with ngrok URL
- [ ] Call YOUR_TWILIO_NUMBER to test!
- [ ] Deploy to production (when ready)

---

## 🎉 You're Ready!

Your AI voice agent is configured and waiting for calls!

### Quick Start:
```powershell
npm install
npm start
```

### Then (in new terminal):
```powershell
npx ngrok http 3000
```

### Finally:
1. Copy ngrok URL
2. Set Twilio webhook: `https://your-ngrok-url/voice/incoming`
3. Call: **YOUR_TWILIO_NUMBER**
4. Start talking to Alex! 🎤

---

## 🆘 Need Help?

1. **Quick Reference**: See `QUICK-REF.md`
2. **Your Setup**: See `YOUR-SETUP.md`
3. **Troubleshooting**: See `TROUBLESHOOTING.md`
4. **Run Tests**: `npm test`

---

**🌟 Your AI Influencer is ready to take calls! Let's go! 🚀**
