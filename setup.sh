#!/bin/bash

echo "🚀 Setting up Verbio - Real-time Voice Translation Platform"
echo "=========================================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ .env.local created. Please add your OpenAI API key."
else
    echo "✅ .env.local already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p tests/e2e
mkdir -p public/audio
mkdir -p prisma

# Check Node version
NODE_VERSION=$(node -v | cut -d. -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18.17.0 or higher is required. Current version: $(node -v)"
    exit 1
else
    echo "✅ Node.js version: $(node -v)"
fi

# Check npm version
NPM_VERSION=$(npm -v | cut -d. -f1)
if [ "$NPM_VERSION" -lt 10 ]; then
    echo "⚠️  npm 10.0.0 or higher is recommended. Current version: $(npm -v)"
else
    echo "✅ npm version: $(npm -v)"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Edit .env.local and add your OpenAI API key"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Available Commands:"
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"
echo "  npm run lint       - Run linter"
echo "  npm test           - Run tests"
echo "  npm run type-check - Check TypeScript types"
echo ""
echo "✨ Setup complete! Happy coding!"