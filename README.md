# Verbio - Real-time Voice Translation Platform

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
  [![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai)](https://openai.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jwillz7667/Verbio&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20Key%20with%20access%20to%20Whisper%2C%20GPT-4%2C%20and%20TTS&project-name=verbio&repository-name=verbio)

  **Break language barriers with real-time AI-powered voice translation**
  
  [Live Demo](https://verbio.vercel.app) • [Report Bug](https://github.com/jwillz7667/Verbio/issues) • [Request Feature](https://github.com/jwillz7667/Verbio/issues)

</div>

## ✨ Features

- 🎙️ **Real-time Voice Translation** - Instant translation between English and Spanish
- 🤖 **Automatic Language Detection** - AI-powered language recognition
- 🔊 **Natural Voice Synthesis** - Multiple voice options (male/female/neutral)
- 💬 **Conversation Mode** - Continuous translation for natural dialogue
- 🎨 **Modern Glassmorphism UI** - Beautiful animations and neon effects
- ⚡ **Lightning Fast** - Optimized for speed with Next.js 14
- 🔒 **Secure** - API keys stored server-side, protected routes
- 📱 **Responsive** - Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key with access to:
  - Whisper API (speech-to-text)
  - GPT-4 (translation)
  - Text-to-Speech API

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jwillz7667/Verbio.git
cd Verbio
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Create .env.local file
echo "OPENAI_API_KEY=your_api_key_here" > .env.local
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🎯 Usage

1. **Grant microphone permission** when prompted
2. **Choose your voice preference** (Auto/Male/Female)
3. **Enable conversation mode** for continuous translation
4. **Press the microphone button** or hit `Space` to start
5. **Speak naturally** in English or Spanish
6. **Listen to the translation** with natural voice output

### Keyboard Shortcuts

- `Space` - Toggle recording
- `S` - Swap languages (manual mode)
- `C` - Clear conversation
- `Escape` - Cancel recording

## 🛠️ Tech Stack

<table>
<tr>
<td>

**Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3.4
- Framer Motion

</td>
<td>

**AI/ML**
- OpenAI Whisper
- GPT-4 Turbo
- OpenAI TTS
- Web Audio API
- Real-time streaming

</td>
<td>

**Infrastructure**
- Vercel Edge Functions
- Vercel KV (Redis)
- PostgreSQL (optional)
- GitHub Actions
- Sentry monitoring

</td>
</tr>
</table>

## 📦 Project Structure

```
verbio/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   ├── realtime/      # Translation endpoint
│   │   └── health/        # Health check
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ModernConversationDisplay.tsx
│   ├── VoiceVisualizer.tsx
│   └── LanguageSelector.tsx
├── hooks/                 # Custom React hooks
│   ├── useRealtimeTranslation.ts
│   └── useAudioRecorder.ts
├── lib/                   # Utility functions
└── public/               # Static assets
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jwillz7667/Verbio&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20Key%20with%20access%20to%20Whisper%2C%20GPT-4%2C%20and%20TTS&project-name=verbio&repository-name=verbio)

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🧪 Development

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm test

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key with Whisper, GPT-4, TTS access | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ❌ |
| `NEXTAUTH_SECRET` | NextAuth.js secret | ❌ |
| `KV_URL` | Vercel KV Redis URL | ❌ |

## 📈 Performance

- **Translation latency:** < 500ms average
- **Audio quality:** 24kHz PCM16
- **Supported browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **API timeout:** 60s for audio processing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for powerful AI models
- [Vercel](https://vercel.com) for hosting and deployment
- [Next.js](https://nextjs.org) team for the amazing framework
- All contributors and users of Verbio

## 📞 Support

- 📧 Email: support@verbio.app
- 🐛 Issues: [GitHub Issues](https://github.com/jwillz7667/Verbio/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/jwillz7667/Verbio/discussions)

---

<div align="center">
  Made with ❤️ and ☕ by <a href="https://github.com/jwillz7667">jwillz7667</a>
  <br>
  ⭐ Star us on GitHub — it helps!
</div>