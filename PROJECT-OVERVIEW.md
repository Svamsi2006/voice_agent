# 📞 AI Conversational Phone Agent - Project Overview

## 🎯 What This Project Does

This is a **fully automated AI phone agent** that can:
- ✅ Answer incoming phone calls via Twilio
- ✅ Have natural conversations using OpenAI GPT or Google Gemini
- ✅ Understand speech and respond with realistic voice
- ✅ Remember conversation context (last 5 turns)
- ✅ Perform actions like checking orders and scheduling appointments
- ✅ Transfer calls to human agents when needed
- ✅ Handle 50+ concurrent calls

## 🏗️ Architecture

```
┌─────────────┐
│   Caller    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Twilio Phone Number             │
└──────┬─────────────────────────┬────┘
       │                         │
       │ Voice Webhook           │ Media Stream (WebSocket)
       ▼                         ▼
┌─────────────┐          ┌──────────────────┐
│  Express    │◄────────►│  WebSocket       │
│  Server     │          │  Handler         │
└─────────────┘          └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │ Google   │  │OpenAI or │  │ Google   │
              │   STT    │  │ Gemini   │  │   TTS    │
              └──────────┘  └─────┬────┘  └──────────┘
                                  │
                                  │ Function Calling
                                  ▼
                         ┌─────────────────┐
                         │  External APIs  │
                         │  - Database     │
                         │  - Calendar     │
                         └─────────────────┘
```

## 📦 What's Included

### Core Application Files

| File | Purpose |
|------|---------|
| `src/server.js` | Main Express server with WebSocket support |
| `src/services/twilioHandler.js` | Call handling and media streaming |
| `src/services/speechToText.js` | Google Cloud Speech-to-Text integration |
| `src/services/textToSpeech.js` | Google Cloud Text-to-Speech integration |
| `src/services/llmService.js` | OpenAI/Gemini LLM integration |
| `src/services/toolCalling.js` | External API integrations (database, calendar) |
| `src/utils/conversationMemory.js` | Conversation context management |
| `src/utils/logger.js` | Logging utility |
| `src/config/systemPrompt.js` | AI agent personality configuration |
| `src/config/tools.json` | Tool schemas for function calling |
| `src/routes/status.js` | Monitoring and status endpoints |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete setup and usage guide |
| `QUICKSTART.md` | 10-minute quick start guide |
| `DEPLOYMENT.md` | Production deployment guides |
| `TROUBLESHOOTING.md` | Common issues and solutions |
| `PRD-CHECKLIST.md` | Implementation checklist |

### Configuration & Setup

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `.env.example` | Environment variables template |
| `.gitignore` | Git ignore rules |
| `setup-wizard.js` | Interactive setup tool |
| `src/test-call.js` | Testing suite |

## 🚀 Quick Commands

```powershell
# Interactive setup (recommended for first time)
npm run setup

# Install dependencies
npm install

# Start server (production mode)
npm start

# Start with auto-reload (development)
npm run dev

# Run tests
npm test
```

## 🔧 Configuration

### Required Environment Variables

```env
# Twilio (Get from: https://console.twilio.com/)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# AI Service (Choose one)
AI_SERVICE=openai  # or 'gemini'
OPENAI_API_KEY=sk-xxxxx  # if using OpenAI
GEMINI_API_KEY=xxxxx     # if using Gemini

# Google Cloud (Get from: https://console.cloud.google.com/)
GOOGLE_PROJECT_ID=your-project
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

## 📊 API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `POST /voice/incoming` - Twilio voice webhook
- `WS /voice/stream` - WebSocket for audio streaming

### Admin/Monitoring Endpoints

- `GET /api/status` - System status and metrics
- `GET /api/sessions` - Active conversation sessions
- `GET /api/sessions/:id` - Specific session details
- `POST /api/cleanup` - Clean up old sessions

## 🎭 Agent Capabilities

### Conversation Features
- Natural language understanding
- Context-aware responses
- Multi-turn conversations
- Sentiment detection
- Interruption handling

### Available Tools
1. **Check Order Status** - Look up order information
2. **Customer Lookup** - Retrieve customer details
3. **Create Appointment** - Schedule new appointments
4. **Update Appointment** - Modify existing appointments
5. **Database Search** - General information lookup

### Transfer Scenarios
The agent will transfer to a human when:
- Customer says "speak to agent", "human", "real person"
- Issue is beyond agent capabilities
- Customer is frustrated after multiple attempts
- Legal or sensitive matters arise

## 📈 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| End-to-End Latency | < 500ms | From user stops speaking to AI starts |
| Speech-to-Text | < 200ms | Google Cloud optimized |
| LLM Response | < 400ms | Depends on model choice |
| Text-to-Speech | < 200ms | Cached for common phrases |
| Concurrent Calls | 50+ | Configurable limit |

## 💰 Estimated Costs

### For 100 hours of calls per month:

| Service | Cost |
|---------|------|
| Twilio Phone + Usage | $10-50 |
| OpenAI API (GPT-4) | $20-100 |
| Google Cloud STT/TTS | $15-40 |
| Hosting | $25-100 |
| **Total** | **$70-290/month** |

### Cost Reduction Tips:
- Use GPT-3.5-turbo instead of GPT-4 (70% cheaper)
- Enable TTS caching (already implemented)
- Set call time limits
- Use spot/preemptible instances

## 🔐 Security Features

- ✅ Twilio webhook signature verification
- ✅ HTTPS enforcement
- ✅ Environment variable for secrets
- ✅ Input validation and sanitization
- ✅ Rate limiting via Twilio
- ✅ Error message sanitization

## 🧪 Testing

### Automated Tests
```powershell
npm test
```

Tests include:
- Health endpoint validation
- Twilio webhook functionality
- Environment variable checks
- Conversation memory
- Tool calling functionality

### Manual Testing
1. Call your Twilio number
2. Try these scenarios:
   - General greeting
   - Ask about order status
   - Request appointment
   - Ask to speak to human

## 📚 Documentation Guide

Start here based on your needs:

| Goal | Read This |
|------|-----------|
| First time setup | [QUICKSTART.md](QUICKSTART.md) |
| Detailed setup | [README.md](README.md) |
| Deploy to production | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Fix an issue | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Check implementation | [PRD-CHECKLIST.md](PRD-CHECKLIST.md) |

## 🎨 Customization

### Change AI Personality
Edit `src/config/systemPrompt.js`

### Add Custom Tools
1. Add tool schema to `src/config/tools.json`
2. Implement function in `src/services/toolCalling.js`

### Change Voice
Modify `TTS_VOICE_NAME` in `.env`

Available voices:
- `en-US-Neural2-F` (Female, default)
- `en-US-Neural2-D` (Male)
- `en-US-Neural2-J` (Male)
- And many more...

### Adjust Performance
```env
MAX_CONCURRENT_CALLS=50
CONVERSATION_HISTORY_TURNS=5
RESPONSE_TIMEOUT_MS=5000
```

## 🚢 Deployment Options

| Platform | Difficulty | Best For |
|----------|-----------|----------|
| Railway | ⭐ Easy | Quick deployment |
| Heroku | ⭐⭐ Medium | Startups |
| Google Cloud Run | ⭐⭐⭐ Medium | Auto-scaling |
| AWS EC2 | ⭐⭐⭐⭐ Hard | Full control |

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guides.

## 🐛 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| High latency | Use GPT-3.5-turbo, enable caching |
| Audio problems | Check TTS voice settings |
| API errors | Verify all API keys are set |
| Webhook fails | Use ngrok for local testing |

Full troubleshooting: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📞 Support Resources

- **Twilio**: https://support.twilio.com
- **OpenAI**: https://help.openai.com
- **Google Cloud**: https://cloud.google.com/support
- **Project Issues**: Check TROUBLESHOOTING.md

## 🎯 Next Steps

1. **Setup**: Run `npm run setup` for guided configuration
2. **Test**: Run `npm test` to verify everything works
3. **Deploy**: Choose a platform from DEPLOYMENT.md
4. **Monitor**: Use `/api/status` endpoint for monitoring
5. **Scale**: Adjust MAX_CONCURRENT_CALLS as needed

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using:**
- Twilio for phone infrastructure
- OpenAI/Gemini for AI intelligence
- Google Cloud for speech processing
- Express.js for the server
- WebSockets for real-time audio

**Ready to deploy!** 🚀
