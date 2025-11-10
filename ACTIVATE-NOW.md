# ⚡ ACTIVATION CHECKLIST - Make Your Phone Agent Work!

## ✅ Current Status

✔️ Server is running (Port 3000)
✔️ Environment variables configured
✔️ Twilio credentials set
✔️ Gemini API key set
✔️ Google Cloud project configured

## ❌ What's Missing (Why Calls Don't Work)

Your server is running **locally** but Twilio can't reach it because:
1. Your server is only accessible on your computer (localhost)
2. Twilio needs a **public URL** to send call data to
3. The webhook in Twilio is not configured yet

---

## 🚀 3 STEPS TO ACTIVATE (5 Minutes)

### STEP 1: Make Your Server Public with ngrok

Open a **NEW PowerShell terminal** (keep the current one running!) and run:

```powershell
npx ngrok http 3000
```

You'll see something like:
```
Forwarding   https://abc123xyz.ngrok.io -> http://localhost:3000
```

**📋 COPY THIS URL**: `https://abc123xyz.ngrok.io`

⚠️ **IMPORTANT**: 
- Keep this terminal window open!
- Keep your server running in the other terminal!
- The URL changes each time you restart ngrok (use paid ngrok for fixed URL)

---

### STEP 2: Configure Twilio Webhook

1. **Go to**: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming

2. **Click on**: Your phone number **YOUR_TWILIO_NUMBER**

3. **Scroll to**: "Voice Configuration" section

4. **Configure**:
   - **A CALL COMES IN**: Select "Webhook"
   - **URL**: Enter: `https://YOUR-NGROK-URL/voice/incoming`
     - Example: `https://abc123xyz.ngrok.io/voice/incoming`
     - ⚠️ Don't forget `/voice/incoming` at the end!
   - **HTTP**: Select "POST"

5. **Click**: Save Configuration (at bottom)

---

### STEP 3: Test Your Agent!

**Call**: YOUR_TWILIO_NUMBER

You should hear:
```
"Hey there! This is Alex! How's your day going?"
```

**Try saying**:
- "Hi Alex, how are you?"
- "Can you check my order?"
- "I need help"

---

## 🔍 Quick Diagnostic

### Check 1: Is Server Running?
```powershell
curl http://localhost:3000/health
```
Should return: `{"status":"healthy",...}`

### Check 2: Is ngrok Running?
Open browser: `http://localhost:4040`
(ngrok web interface shows requests)

### Check 3: Test Webhook URL
In your browser, go to:
```
https://YOUR-NGROK-URL/health
```
Should show: `{"status":"healthy",...}`

---

## 🐛 Troubleshooting

### Problem: "The number you dialed is not in service"
**Solution**: 
- Twilio webhook not configured yet
- Go to Step 2 and configure webhook

### Problem: Call connects but no response
**Solution**: 
- ngrok might not be running
- Check ngrok terminal is still open
- Verify webhook URL includes `/voice/incoming`

### Problem: "We're sorry, an application error has occurred"
**Solution**:
- Check your server terminal for errors
- Make sure `google-credentials.json` exists
- Restart server: `npm start`

### Problem: ngrok URL not working
**Solution**:
```powershell
# Install ngrok globally
npm install -g ngrok

# Then run
ngrok http 3000
```

---

## 📋 Complete Setup Commands

**Terminal 1 (Server)**:
```powershell
cd c:\Users\vamsi\Desktop\voice-agent
npm start
```

**Terminal 2 (ngrok)**:
```powershell
npx ngrok http 3000
# Copy the https:// URL
```

**Browser (Twilio)**:
1. Go to: https://console.twilio.com/
2. Phone Numbers → YOUR_TWILIO_NUMBER
3. Voice Webhook: `https://YOUR-NGROK-URL/voice/incoming`
4. Save

**Phone**:
- Call: YOUR_TWILIO_NUMBER
- Talk to Alex! 🎉

---

## 🔄 Every Time You Start

You need to run **both** commands (in separate terminals):

```powershell
# Terminal 1
npm start

# Terminal 2  
npx ngrok http 3000
```

⚠️ **IMPORTANT**: Update Twilio webhook with new ngrok URL each time!
(Unless you use ngrok paid account for fixed URL)

---

## 🌐 Production Setup (No ngrok needed)

For permanent setup without ngrok, deploy to cloud:

### Option 1: Railway (Easiest - 5 min)
1. Go to: https://railway.app
2. Connect GitHub repo
3. Deploy automatically
4. Get permanent URL
5. Update Twilio webhook once

### Option 2: Heroku
See `DEPLOYMENT.md` for full guide

### Option 3: Google Cloud Run
See `DEPLOYMENT.md` for full guide

---

## ✅ Activation Checklist

- [ ] Server running (`npm start`)
- [ ] ngrok running (`npx ngrok http 3000`)
- [ ] ngrok URL copied
- [ ] Twilio webhook configured with ngrok URL + `/voice/incoming`
- [ ] Twilio webhook saved
- [ ] Test call made to YOUR_TWILIO_NUMBER
- [ ] Heard Alex's greeting! 🎉

---

## 🎯 Current Status Summary

**Your Setup**:
- ✅ Server: Running on port 3000
- ✅ Credentials: All configured
- ✅ Google Cloud: Project "billitup" set
- ⚠️ ngrok: NEEDS TO BE RUNNING
- ⚠️ Twilio Webhook: NEEDS TO BE CONFIGURED

**What You Need to Do**:
1. Run ngrok in new terminal
2. Configure Twilio webhook
3. Call and test!

---

## 📞 Support

If you get stuck:
1. Check both terminals are running
2. Visit ngrok dashboard: http://localhost:4040
3. Check server logs for errors
4. Verify webhook URL is correct in Twilio

---

**🚀 Ready? Open a new terminal and run:**
```powershell
npx ngrok http 3000
```

**Then configure Twilio and call YOUR_TWILIO_NUMBER!**
