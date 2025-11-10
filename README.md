# 📞 AI Conversational Phone Agent

A fully automated, conversational AI phone agent that handles customer interactions via Twilio with real-time voice streaming, powered by OpenAI/Gemini LLMs.

## 🎯 Features

- ✅ **Real-time Voice Streaming**: Low-latency bidirectional audio via Twilio Media Streams
- ✅ **AI-Powered Conversations**: OpenAI GPT-4 or Google Gemini integration
- ✅ **Speech Processing**: Google Cloud Speech-to-Text and Text-to-Speech
- ✅ **Conversation Memory**: Maintains context with last 5 dialogue turns
- ✅ **Tool Calling**: External API integration (database lookup, calendar management)
- ✅ **Call Transfer**: Seamless handoff to human agents when needed
- ✅ **Scalable**: Handles up to 50 concurrent calls

## 📋 Prerequisites

1. **Twilio Account**: Active account with phone number and credits
2. **Google Cloud Account**: For Speech-to-Text and Text-to-Speech APIs
3. **AI Service**: OpenAI API key OR Google Gemini API key
4. **Node.js**: Version 16 or higher

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd c:\Users\vamsi\Desktop\voice-agent
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Choose AI Service (openai or gemini)
AI_SERVICE=openai
OPENAI_API_KEY=sk-xxxxx

# Google Cloud (for STT/TTS)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_PROJECT_ID=your-project-id
```

### 3. Set Up Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Speech-to-Text and Text-to-Speech APIs
3. Create a service account and download JSON credentials
4. Save as `google-credentials.json` in the project root

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 5. Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to Phone Numbers → Manage → Active Numbers
3. Select your phone number
4. Under "Voice Configuration":
   - **A CALL COMES IN**: Webhook
   - **URL**: `https://your-domain.com/voice/incoming`
   - **HTTP Method**: POST
5. Save changes

**Note**: You'll need to deploy to a public URL or use ngrok for local testing:

```bash
ngrok http 3000
```

Then use the ngrok URL: `https://xxxxx.ngrok.io/voice/incoming`

## 🏗️ Architecture

```
┌─────────────┐
│   Caller    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│          Twilio Phone Number        │
└──────┬─────────────────────────┬────┘
       │                         │
       │ Voice Webhook           │ Media Stream (WebSocket)
       ▼                         ▼
┌─────────────┐          ┌──────────────────┐
│  /voice/    │◄────────►│  WebSocket       │
│  incoming   │          │  Handler         │
└─────────────┘          └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │   STT    │  │   LLM    │  │   TTS    │
              │ (Google) │  │(GPT/Gem) │  │ (Google) │
              └──────────┘  └─────┬────┘  └──────────┘
                                  │
                                  │ Tool Calls
                                  ▼
                         ┌─────────────────┐
                         │  External APIs  │
                         │  - Database     │
                         │  - Calendar     │
                         └─────────────────┘
```

## 📁 Project Structure

```
voice-agent/
├── src/
│   ├── server.js                 # Main Express server
│   ├── services/
│   │   ├── twilioHandler.js      # Twilio WebSocket & call handling
│   │   ├── speechToText.js       # Google STT integration
│   │   ├── textToSpeech.js       # Google TTS integration
│   │   ├── llmService.js         # OpenAI/Gemini integration
│   │   └── toolCalling.js        # External tool integrations
│   ├── utils/
│   │   ├── conversationMemory.js # Context management
│   │   └── logger.js             # Logging utility
│   └── config/
│       ├── systemPrompt.js       # AI agent persona
│       └── tools.json            # Tool calling schemas
├── tests/
│   └── test-call.js              # End-to-end testing
├── package.json
├── .env.example
└── README.md
```

## 🔧 Configuration

### System Prompt Customization

Edit `src/config/systemPrompt.js` to customize the AI agent's persona:

```javascript
export const SYSTEM_PROMPT = `You are a polite and helpful customer service agent...`;
```

### Tool Configuration

Define available tools in `src/config/tools.json`:

```json
[
  {
    "name": "checkOrderStatus",
    "description": "Check the status of a customer order",
    "parameters": {...}
  }
]
```

## 🧪 Testing

### Test a Call

```bash
npm test
```

Or manually call your Twilio number and test:
- Regular conversation
- Request order status (tool calling)
- Say "speak to an agent" (call transfer)

### Monitor Logs

The application logs all interactions in real-time:
- Incoming audio transcriptions
- LLM responses
- Tool calls
- Performance metrics

## 🔐 Security Best Practices

- ✅ All webhooks use HTTPS
- ✅ API keys stored in environment variables
- ✅ Twilio webhook signature verification
- ✅ Rate limiting on endpoints
- ✅ Input validation and sanitization

## 📊 Performance Optimization

- **Target Latency**: < 500ms end-to-end
- **STT**: Google Speech-to-Text (streaming mode)
- **LLM**: Streaming responses for faster TTFB
- **TTS**: Cached responses for common phrases
- **Concurrent Calls**: Up to 50 simultaneous calls

## 🛠️ Troubleshooting

### High Latency
- Check API response times in logs
- Consider using smaller LLM models
- Enable response streaming
- Use CDN for static assets

### Audio Issues
- Verify Google Cloud credentials
- Check microphone permissions
- Test with different TTS voices
- Adjust audio encoding settings

### Tool Calling Not Working
- Verify tool schema format
- Check LLM model supports function calling
- Review system prompt instructions

## 📚 API Reference

### Endpoints

- `POST /voice/incoming` - Twilio voice webhook
- `GET /health` - Health check endpoint
- `GET /status` - Server statistics

### WebSocket Events

- `media` - Audio data from caller
- `start` - Call session started
- `stop` - Call session ended

## 🚢 Deployment

### Recommended Platforms

1. **Heroku**: Easy deployment with buildpacks
2. **AWS EC2**: Full control, scalable
3. **Google Cloud Run**: Serverless, auto-scaling
4. **Railway**: Simple, developer-friendly

### Environment Variables Checklist

- [ ] TWILIO_ACCOUNT_SID
- [ ] TWILIO_AUTH_TOKEN
- [ ] TWILIO_PHONE_NUMBER
- [ ] OPENAI_API_KEY or GEMINI_API_KEY
- [ ] GOOGLE_APPLICATION_CREDENTIALS
- [ ] All service API keys

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Open an issue on GitHub

---

Built with ❤️ using Twilio, OpenAI/Gemini, and Google Cloud
