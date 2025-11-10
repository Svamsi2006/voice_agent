# ⚡ QUICK REFERENCE - Your AI Voice Agent

## 🎯 Your Setup
- **Phone**: YOUR_TWILIO_NUMBER
- **AI**: Gemini (Alex, the influencer)
- **Status**: ✅ Pre-configured

---

## 🚀 GET STARTED (Copy & Paste These Commands)

### 1️⃣ Install (First Time Only)
```powershell
cd c:\Users\vamsi\Desktop\voice-agent
npm install
```

### 2️⃣ Start Server
```powershell
npm start
```

### 3️⃣ Make It Public (New Terminal)
```powershell
npx ngrok http 3000
```
Copy the `https://` URL from ngrok

### 4️⃣ Configure Twilio
1. Go to: https://console.twilio.com/
2. Phone Numbers → YOUR_TWILIO_NUMBER
3. Voice Webhook: `https://YOUR-NGROK-URL/voice/incoming`
4. Save

### 5️⃣ Test
Call: **YOUR_TWILIO_NUMBER** 📞

---

## ⚠️ IMPORTANT: Google Cloud Setup Required

You need Google Cloud credentials for speech:

### Quick Setup:
1. Visit: https://console.cloud.google.com/
2. Create project
3. Enable: Speech-to-Text + Text-to-Speech APIs
4. Create Service Account → Download JSON key
5. Save as: `google-credentials.json` in project folder
6. Update `.env`: Set `GOOGLE_PROJECT_ID=your-project-id`

**Free $300 credit for new users!**

---

## 📁 Files You Need

Your project folder needs:
```
voice-agent/
├── .env (✅ Already configured)
├── google-credentials.json (⚠️ YOU NEED TO ADD THIS)
└── ... (everything else is ready)
```

---

## 🎤 Test Conversation Examples

**Greeting**:
- Call → "Hey there! This is Alex! How's your day going?"

**Order Check**:
- You: "Check my order"
- Alex: "For sure! What's your order number?"

**Just Chat**:
- You: "How are you?"
- Alex: "I'm doing awesome! How about you?"

**Schedule**:
- You: "Book an appointment"
- Alex: "Absolutely! When works for you?"

---

## 🔧 Useful Commands

```powershell
# Start server
npm start

# Run with debug logs
$env:LOG_LEVEL="DEBUG"; npm start

# Test configuration
npm test

# Check health
curl http://localhost:3000/health

# View status
curl http://localhost:3000/api/status
```

---

## 🎨 Quick Customizations

### Change Voice to Male
Edit `.env`:
```
TTS_VOICE_NAME=en-US-Neural2-D
```

### Make Responses Longer/Shorter
Edit `src/services/llmService.js`:
```javascript
max_tokens: 150  // Change this number
```

### Change Personality
Edit `src/config/systemPrompt.js`

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't install | `npm cache clean --force` then `npm install` |
| No speech | Add `google-credentials.json` |
| Webhook 403 | Check ngrok URL is correct |
| Slow response | First call is slow, next ones faster |

---

## 📞 Your Details

**Twilio**:
- Account: Configured in .env ✅
- Phone: Configured in .env ✅

**Gemini**:
- Service: gemini-pro
- API Key: Configured ✅

**Agent**:
- Name: Alex
- Style: Influencer personality
- Voice: Female (Neural2-F)

---

## ✅ Pre-Launch Checklist

- [ ] Run `npm install`
- [ ] Add `google-credentials.json` file
- [ ] Set `GOOGLE_PROJECT_ID` in `.env`
- [ ] Run `npm start`
- [ ] Run `npx ngrok http 3000` (new terminal)
- [ ] Configure Twilio webhook with ngrok URL
- [ ] Call YOUR_TWILIO_NUMBER to test! 🎉

---

## 📚 Full Documentation

- `YOUR-SETUP.md` ← **START HERE** (detailed guide)
- `QUICKSTART.md` (10-min setup)
- `README.md` (complete docs)
- `TROUBLESHOOTING.md` (if stuck)
- `DEPLOYMENT.md` (go live)

---

## 🎉 That's It!

**Three commands to start**:
```powershell
npm install
npm start
npx ngrok http 3000  # (in new terminal)
```

Then configure Twilio and call **YOUR_TWILIO_NUMBER**! 📞
