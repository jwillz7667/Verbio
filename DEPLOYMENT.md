# Verbio Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- OpenAI API key with access to Whisper, GPT-4, and TTS APIs
- GitHub repository connected

## Environment Variables

Set the following environment variables in your Vercel project settings:

### Required
- `OPENAI_API_KEY` - Your OpenAI API key with access to:
  - Whisper API for speech-to-text
  - GPT-4 for translation
  - Text-to-Speech API for audio generation

### Optional (for future features)
- `DATABASE_URL` - PostgreSQL connection string (if using database features)
- `NEXTAUTH_SECRET` - Random secret for authentication (if implementing auth)
- `KV_URL` - Vercel KV Redis URL (for session storage)
- `SENTRY_DSN` - Sentry error tracking (for production monitoring)

## Deployment Steps

### 1. Deploy to Vercel

#### Option A: Deploy with Vercel CLI
```bash
npm i -g vercel
vercel
```

#### Option B: Deploy via GitHub Integration
1. Go to https://vercel.com/new
2. Import your GitHub repository: `jwillz7667/Verbio`
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 2. Configure Environment Variables
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the required variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### 3. Configure Domain (Optional)
1. Go to Settings ’ Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Important Configuration Notes

### API Routes
The following API routes are configured with extended timeouts:
- `/api/realtime` - 60 seconds (for audio processing)
- `/api/translate` - 30 seconds (for translation)

### Security Headers
The deployment includes security headers for:
- CORS protection
- XSS protection
- Content Security Policy
- HTTPS enforcement

### Regions
The app is configured to deploy to:
- `iad1` (US East)
- `sfo1` (US West)
- `lhr1` (Europe)

## Local Development

To test the production build locally:

```bash
# Build the production version
npm run build

# Start the production server
npm start
```

## Monitoring

### Check Deployment Status
- Visit your Vercel dashboard
- Monitor function logs in Vercel Functions tab
- Check API route performance in Analytics

### Common Issues

1. **API Key Not Working**
   - Ensure your OpenAI API key has access to all required models
   - Check API key usage limits

2. **Audio Not Playing**
   - Verify CSP headers allow media from 'self' and 'blob:'
   - Check browser console for errors

3. **Translation Timeout**
   - Function timeout is set to 60 seconds
   - Consider optimizing audio file size

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] OpenAI API key has sufficient credits
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Security headers verified
- [ ] API rate limiting configured
- [ ] Error tracking enabled (optional)
- [ ] Analytics enabled

## Support

For deployment issues:
- Check Vercel deployment logs
- Review function logs for API errors
- Ensure all environment variables are set correctly

## Updates

To deploy updates:
1. Push changes to GitHub main branch
2. Vercel will automatically deploy
3. Monitor deployment in Vercel dashboard

---

Last updated: 2025