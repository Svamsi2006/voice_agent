# AI Voice Agent Deployment Guide

## Deployment Options

### Option 1: Heroku (Recommended for Quick Start)

1. **Install Heroku CLI**
   ```bash
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-voice-agent-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_token
   heroku config:set TWILIO_PHONE_NUMBER=your_number
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set GOOGLE_PROJECT_ID=your_project
   # ... set all other variables from .env
   ```

4. **Upload Google Credentials**
   ```bash
   # Add credentials as a config var
   heroku config:set GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat google-credentials.json)"
   ```
   
   Then modify your code to write this to a file at startup:
   ```javascript
   // In server.js
   if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
     const fs = require('fs');
     fs.writeFileSync('./google-credentials.json', 
       process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
     process.env.GOOGLE_APPLICATION_CREDENTIALS = './google-credentials.json';
   }
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-voice-agent-name
   git push heroku main
   ```

6. **Configure Twilio Webhook**
   - Go to Twilio Console
   - Set webhook URL to: `https://your-voice-agent-name.herokuapp.com/voice/incoming`

---

### Option 2: AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu Server 22.04 LTS
   - t3.medium or larger
   - Configure security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

3. **Deploy Application**
   ```bash
   cd /home/ubuntu
   git clone your-repo-url voice-agent
   cd voice-agent
   npm install
   
   # Copy your .env and google-credentials.json files
   ```

4. **Setup PM2**
   ```bash
   pm2 start src/server.js --name voice-agent
   pm2 startup
   pm2 save
   ```

5. **Install Nginx (Reverse Proxy)**
   ```bash
   sudo apt install nginx
   
   # Create nginx config
   sudo nano /etc/nginx/sites-available/voice-agent
   ```
   
   Config content:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/voice-agent /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 3: Google Cloud Run (Serverless)

1. **Install gcloud CLI**
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["node", "src/server.js"]
   ```

3. **Build and Deploy**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   
   # Build container
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/voice-agent
   
   # Deploy to Cloud Run
   gcloud run deploy voice-agent \
     --image gcr.io/YOUR_PROJECT_ID/voice-agent \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars TWILIO_ACCOUNT_SID=your_sid,OPENAI_API_KEY=your_key
   ```

4. **Set Secrets**
   ```bash
   # Store Google credentials as secret
   gcloud secrets create google-creds --data-file=google-credentials.json
   
   # Mount secret in Cloud Run
   gcloud run services update voice-agent \
     --update-secrets GOOGLE_APPLICATION_CREDENTIALS=/secrets/google-creds:latest
   ```

---

### Option 4: Railway (Easiest)

1. **Sign up at [railway.app](https://railway.app)**

2. **Deploy from GitHub**
   - Connect your GitHub repository
   - Railway auto-detects Node.js project
   - Add environment variables in Railway dashboard

3. **Configure**
   - Add all environment variables from `.env`
   - Upload `google-credentials.json` as a file
   - Set `GOOGLE_APPLICATION_CREDENTIALS=/app/google-credentials.json`

4. **Deploy**
   - Railway automatically deploys on push
   - Get your URL from Railway dashboard
   - Configure Twilio webhook

---

## Post-Deployment Checklist

- [ ] Server is running and accessible
- [ ] Health endpoint returns 200 OK
- [ ] All environment variables are set
- [ ] SSL certificate is active (HTTPS)
- [ ] Twilio webhook is configured
- [ ] Test call completes successfully
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerting
- [ ] Configure auto-scaling if needed
- [ ] Set up backups for conversation logs

---

## Monitoring and Maintenance

### Health Checks
```bash
# Check server health
curl https://your-domain.com/health

# Monitor logs (Heroku)
heroku logs --tail

# Monitor logs (PM2)
pm2 logs voice-agent

# Monitor logs (Cloud Run)
gcloud run services logs read voice-agent
```

### Performance Monitoring

Consider adding these services:
- **Sentry**: Error tracking
- **DataDog**: Application monitoring
- **LogRocket**: Session replay
- **Grafana**: Custom dashboards

### Auto-Scaling

Configure auto-scaling based on:
- Concurrent call count
- CPU usage
- Response time
- Error rate

---

## Troubleshooting

### Issue: High Latency
- Check API response times in logs
- Consider using smaller LLM models
- Enable response streaming
- Add Redis cache for common responses

### Issue: WebSocket Disconnections
- Increase timeout settings
- Check firewall/security group rules
- Verify WebSocket support on platform
- Monitor connection pool

### Issue: Audio Quality Problems
- Verify audio encoding settings (mulaw, 8kHz)
- Check TTS voice configuration
- Test with different Twilio numbers
- Monitor packet loss

---

## Cost Optimization

### Typical Monthly Costs (100 hours of calls)

| Service | Estimated Cost |
|---------|---------------|
| Twilio (phone + usage) | $10-50 |
| OpenAI API | $20-100 |
| Google Cloud (STT/TTS) | $15-40 |
| Hosting (Heroku/AWS) | $25-100 |
| **Total** | **$70-290/month** |

### Cost Reduction Tips
1. Use smaller LLM models when possible
2. Cache TTS responses for common phrases
3. Implement call length limits
4. Use spot/preemptible instances
5. Monitor and optimize API usage
