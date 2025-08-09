# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Verbio is a real-time voice translation platform built with Next.js 14 (App Router) that enables live translation between English and Spanish using OpenAI's Realtime API. The application captures audio, transcribes it, translates it, and provides both text and audio output.

## Development Commands

### Core Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking without emitting files

### Code Quality (ALWAYS run before completing a task)
- `npm run lint` - Run Next.js linter and ESLint on .ts/.tsx files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format all code with Prettier

### Testing
- `npm test` - Run Jest tests with coverage (70% threshold)
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI mode

### Other Commands
- `npm run analyze` - Analyze bundle size
- `npm run lighthouse` - Run Lighthouse CI performance tests
- `npm run ci` - Full CI pipeline (type-check, lint, build, test, e2e, lighthouse)

## Architecture

### Core Technologies
- **Next.js 14** with App Router for server components and API routes
- **TypeScript** with strict mode enabled
- **Tailwind CSS** for styling with custom utility classes via `cn()` helper
- **OpenAI Realtime API** (GPT-4o) for voice transcription and translation
- **WebSockets/SSE** for real-time communication
- **Vercel KV** (Redis) for session storage
- **Prisma** for database ORM

### Key Application Flow

1. **Audio Capture** (`hooks/useAudioRecorder.ts`): 
   - Captures microphone input using Web Audio API
   - Processes audio at 24kHz sample rate (OpenAI requirement)
   - Converts Float32 to PCM16 format
   - Streams PCM16 audio chunks to the translation service

2. **Real-time Translation** (`hooks/useRealtimeTranslation.ts`):
   - Manages WebSocket connection to OpenAI Realtime API via Next.js API route
   - Handles bidirectional audio streaming with base64 encoding
   - Processes transcription deltas and translation responses
   - Manages audio playback queue for translated speech
   - Auto-reconnect on disconnect (3-second delay)

3. **API Integration** (`app/api/realtime/route.ts`):
   - Proxies WebSocket connection to OpenAI Realtime API
   - Uses Server-Sent Events (SSE) for client communication (Next.js App Router limitation)
   - Handles authentication with OpenAI API key (server-side only)
   - Configures session with voice (alloy), languages, and VAD settings
   - Model: `gpt-4o-realtime-preview-2024-12-17`

4. **UI Components**:
   - `TranslationControls` - Recording button and status
   - `LanguageSelector` - Source/target language selection with swap functionality
   - `ConversationDisplay` - Shows translation history with audio playback
   - `VoiceVisualizer` - Real-time audio level visualization
   - `ConnectionStatus` - WebSocket connection state indicator

### State Management
- React hooks for local component state
- Zustand store configured for global state (see package.json)
- React Query (`@tanstack/react-query`) for server state management

### Path Aliases
The project uses TypeScript path aliases defined in `tsconfig.json`:
- `@/*` → `./app/*`
- `@/components/*` → `./components/*`
- `@/features/*` → `./features/*` (translation hooks and libs)
- `@/hooks/*` → `./hooks/*`
- `@/lib/*` → `./lib/*`
- `@/store/*` → `./store/*`
- `@/utils/*` → `./utils/*`
- `@/types/*` → `./types/*`
- `@/styles/*` → `./styles/*`
- `@/public/*` → `./public/*`

## Environment Configuration

Required environment variables:
- `OPENAI_API_KEY` - OpenAI API key with Realtime API access (server-side only)

Optional environment variables (for production features):
- `DATABASE_URL` - PostgreSQL connection string (Prisma database)
- `KV_URL` - Vercel KV Redis URL (session storage)
- `NEXTAUTH_SECRET` - Random secret for authentication
- `SENTRY_DSN` - Sentry error tracking
- `NEXT_PUBLIC_OPENAI_API_KEY` - Client-side API key (not recommended)

## Important Technical Details

### Audio Processing Pipeline
- **Input Format**: PCM16 at 24kHz sample rate
- **Transmission**: Base64 encoding for WebSocket messages
- **Output**: PCM16 converted to Float32 for Web Audio API playback
- **Audio Context**: 24kHz sample rate maintained throughout

### WebSocket Communication Protocol
Messages to OpenAI Realtime API:
- `session.update` - Configure language pair, voice, VAD parameters
- `input_audio_buffer.append` - Stream audio chunks
- `input_audio_buffer.commit` - Finalize audio buffer
- `response.create` - Request translation with text and audio

Response handling:
- `session.created/updated` - Session configuration confirmed
- `response.audio.delta` - Receive audio chunks
- `response.text.delta` - Live transcription updates
- `input_audio_buffer.speech_started/stopped` - VAD events
- `conversation.item.created` - Final translation result

### Keyboard Shortcuts
- `Space` - Toggle recording
- `S` - Swap languages
- `C` - Clear conversation
- `Escape` - Cancel recording

### Performance Targets
- Translation latency: < 500ms average
- Connection time: < 1s
- Audio quality: 24kHz PCM16
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Testing Strategy

- Unit tests with Jest and React Testing Library
- E2E tests with Playwright (Chrome, Firefox, Safari, Mobile)
- Test files follow `*.test.ts` or `*.test.tsx` pattern
- Coverage threshold: 70% for branches, functions, lines, statements
- Test paths mapped to TypeScript aliases

## Security & Deployment

- API keys stored server-side only, never exposed to client
- HTTPS/WSS encryption enforced via headers
- Rate limiting configured with `rate-limiter-flexible`
- CSP headers for XSS protection
- CORS configured per environment (production: verbio.app only)
- Deployed on Vercel with automatic CI/CD from main branch
- API route timeouts: 60s for `/api/realtime`, 30s for `/api/translate`

## Database Schema (Prisma)

Main entities:
- `Profile` - User profiles with authentication
- `TranslationSession` - Translation sessions with language pairs
- `Message` - Individual messages with text, audio, and metadata
- `AuditLog` - Activity tracking

Run `npx prisma studio` to view/edit database locally.