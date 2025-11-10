# 🚀 YOUR AI VOICE AGENT - READY TO GO!

Your AI influencer phone agent is configured and ready to receive calls!

## ✅ Your Configuration

### Twilio Setup
- **Phone Number**: Configured in .env ✅
- **Account SID**: Configured in .env ✅
- **Status**: ✅ Configured

### AI Service
- **Service**: Google Gemini (Live Conversational AI)
- **Model**: gemini-pro
- **Status**: ✅ API Key configured

### Agent Personality
- **Name**: Alex
- **Style**: Energetic influencer who loves connecting with people
- **Tone**: Warm, authentic, conversational

---

## 🎯 What Happens When Someone Calls

1. **Call Received** → Your Twilio number (YOUR_TWILIO_NUMBER) receives the call
2. **AI Greeting** → Alex (your AI influencer) answers enthusiastically
3. **Live Conversation** → Real-time back-and-forth conversation using Gemini
4. **Smart Responses** → AI remembers context and responds naturally
5. **Actions** → Can check orders, schedule appointments, or just chat!

---

## 🚀 QUICK START (3 Steps)

### Step 1: Install Dependencies (2 minutes)
```powershell
cd c:\Users\vamsi\Desktop\voice-agent
npm install
```

### Step 2: Setup Google Cloud (for Speech) (5 minutes)

You need Google Cloud for Speech-to-Text and Text-to-Speech:

1. Go to: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable these APIs:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
4. Create Service Account:
   - IAM & Admin → Service Accounts → Create
   - Grant roles: "Speech Client" and "Cloud Text-to-Speech User"
   - Create Key (JSON) → Download
5. Save the JSON file as `google-credentials.json` in your project folder
6. Update `.env` with your project ID:
   ```
   GOOGLE_PROJECT_ID=your-project-id
   ```

**Note**: Google Cloud offers $300 free credit for new users!

### Step 3: Start the Server (1 minute)
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

## 🌐 Make It Public (For Testing Locally)

Your server needs to be accessible from the internet for Twilio to reach it.

### Option A: Use ngrok (Recommended for Testing)
```powershell
# In a new terminal
npx ngrok http 3000
```

This will give you a public URL like: `https://abc123.ngrok.io`

### Option B: Deploy to Cloud (For Production)
See `DEPLOYMENT.md` for guides on:
- Railway (easiest)
- Heroku
- Google Cloud Run
- AWS

---

## 📞 Configure Twilio Webhook

### Steps:
1. Go to: https://console.twilio.com/
2. Click **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your Twilio phone number
4. Scroll to **Voice Configuration**:
   - **A CALL COMES IN**: Select "Webhook"
   - **URL**: Enter your public URL + `/voice/incoming`
     - Local testing: `https://your-ngrok-url.ngrok.io/voice/incoming`
     - Production: `https://your-domain.com/voice/incoming`
   - **HTTP Method**: POST
5. Click **Save**

---

## 🎉 TEST YOUR AGENT!

### Test Call Script:

**Call**: Your Twilio number (check .env file)

**Expected Conversation**:
```
AI (Alex): "Hey there! This is Alex! How's your day going?"

You: "Hi Alex, I'm doing good!"

AI: "Awesome! I love to hear that! What can I help you with today?"

You: "Can you check my order status?"

AI: "Oh for sure! Let me grab that for you real quick! 
     Do you have your order number handy?"

You: "It's 12345"

AI: "Perfect! Let me check that for you... [checks order] 
     Great news! Your order 12345 is on its way to you! 
     Should arrive by November 15th!"
```

### Try These Scenarios:

1. **Just Chat**: "Hey, how's it going?"
2. **Order Status**: "Where's my order?"
3. **Schedule Appointment**: "I need to book an appointment"
4. **General Question**: "Tell me about your products"

---

## 🎨 Your AI Personality

**Alex's Character**:
- 🌟 Energetic and enthusiastic
- 💬 Conversational and authentic
- 🤝 Genuinely interested in people
- 😊 Positive and uplifting
- 🎯 Helpful without being pushy

**Speaking Style**:
- Uses natural language: "you know", "honestly", "for sure"
- Keeps it real and relatable
- Matches caller's energy
- Shows personality and emotion

**Example Responses**:
- ❌ Formal: "Good day. How may I assist you?"
- ✅ Alex: "Hey! So great to hear from you! What's on your mind?"

---

## 📊 Monitor Your Agent

While the server is running:

### Check System Status:
```
http://localhost:3000/api/status
```

### View Active Calls:
```
http://localhost:3000/api/sessions
```

### Health Check:
```
http://localhost:3000/health
```

---

## 🎯 Next Steps

### 1. **Test Locally** (Now)
```powershell
npm install
# Add google-credentials.json
npm start
# In new terminal: npx ngrok http 3000
# Configure Twilio webhook
# Call your number!
```

### 2. **Customize** (Optional)
- Change voice: Edit `TTS_VOICE_NAME` in `.env`
- Modify personality: Edit `src/config/systemPrompt.js`
- Add custom tools: Edit `src/services/toolCalling.js`

### 3. **Deploy to Production** (When Ready)
- Follow `DEPLOYMENT.md` guide
- Choose platform (Railway, Heroku, etc.)
- Update Twilio webhook to production URL

---

## 🐛 Troubleshooting

### "Failed to transcribe audio"
➡️ Check that `google-credentials.json` exists and `GOOGLE_PROJECT_ID` is set

### "Gemini API error"
➡️ Verify your API key is correct in `.env`

### "Twilio webhook fails"
➡️ Make sure ngrok is running and webhook URL is correct

### "High latency"
➡️ This is normal for first response. Subsequent responses should be faster.

### Need more help?
➡️ Check `TROUBLESHOOTING.md` for detailed solutions

---

## 💡 Pro Tips

1. **Test the greeting first**: Just call and say "Hello" to test the personality

2. **Enable debug logging**: Set `LOG_LEVEL=DEBUG` in `.env` to see everything

3. **Watch the console**: Keep the terminal open to see real-time logs

4. **Test different scenarios**: Try various conversation flows

5. **Adjust personality**: Edit the system prompt to match your exact style

---

## 🎤 Voice Options

Want to change Alex's voice? Edit `.env`:

**Female Voices** (Current: Neural2-F):
```
TTS_VOICE_NAME=en-US-Neural2-F  # Default
TTS_VOICE_NAME=en-US-Neural2-C  # Alternative
TTS_VOICE_NAME=en-US-Neural2-G
TTS_VOICE_NAME=en-US-Neural2-H
```

**Male Voices**:
```
TTS_VOICE_NAME=en-US-Neural2-A
TTS_VOICE_NAME=en-US-Neural2-D
TTS_VOICE_NAME=en-US-Neural2-I
TTS_VOICE_NAME=en-US-Neural2-J
```

---

## 📞 Your Twilio Number

**YOUR_TWILIO_NUMBER**

This number is now configured to:
- ✅ Receive incoming calls
- ✅ Trigger your AI agent (Alex)
- ✅ Have live, natural conversations
- ✅ Remember context during calls
- ✅ Take actions when needed

---

## 🚀 Ready to Launch!

### Quick Launch Checklist:
- [ ] `npm install` completed
- [ ] `google-credentials.json` added to project
- [ ] `GOOGLE_PROJECT_ID` set in `.env`
- [ ] `npm start` running successfully
- [ ] ngrok running (for local testing)
- [ ] Twilio webhook configured
- [ ] Test call made successfully!

---

## 🎉 You're All Set!

Call **YOUR_TWILIO_NUMBER** and start talking to Alex, your AI influencer!

**Questions? Issues?**
- Check `TROUBLESHOOTING.md`
- Run `npm test` to diagnose
- Enable debug mode: `LOG_LEVEL=DEBUG`

**Want to deploy?**
- See `DEPLOYMENT.md` for production setup

---

**Have fun with your AI influencer agent! 🌟📞**
