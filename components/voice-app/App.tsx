"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ListeningOrb3D as ListeningOrb } from '@/components/visual';
import { LanguageSelector } from './LanguageSelector';
import { AudioControls } from './AudioControls';
import { TipsPopup } from './TipsPopup';
import { TranslationResult } from './TranslationResult';
import { VerbioLogo } from './VerbioLogo';
import { AnimatedBackground } from './AnimatedBackground';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { AccountSettings } from './AccountSettings';
import { Button } from '@/components/voice-app/ui/button';
import { Input } from '@/components/voice-app/ui/input';
import { ArrowLeft, User, Mic, Camera, Keyboard, HelpCircle } from 'lucide-react';
import { motion, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { toLangCode } from '@/lib/i18n/languages';
import { translateTextClient } from '@/lib/api/translate';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useRealtimeVoiceRealtime } from '@/hooks/useRealtimeVoiceRealtime';

type Page = 'main' | 'signin' | 'signup' | 'settings';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    autoTranslate: boolean;
    saveHistory: boolean;
  };
}

interface TranslationData {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  inputType: 'voice' | 'text';
  confidence?: number;
  isProcessing?: boolean;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [isListening, setIsListening] = useState(false);
  const [fromLanguage, setFromLanguage] = useState('English');
  const [toLanguage, setToLanguage] = useState('Spanish');
  const [showTips, setShowTips] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [translationData, setTranslationData] = useState<TranslationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep current language names and codes in refs to avoid effect churn
  const fromLangNameRef = useRef(fromLanguage);
  const toLangNameRef = useRef(toLanguage);
  const fromLangCodeRef = useRef<'en' | 'es'>(toLangCode(fromLanguage));
  const toLangCodeRef = useRef<'en' | 'es'>(toLangCode(toLanguage));

  // Accumulate streaming partials (assistant text)
  const partialRef = useRef('');
  const { connect: connectRtc, disconnect: disconnectRtc, isConnected, isConnecting, remoteAudioRef } = useRealtimeVoiceRealtime({
    onPartialText: (delta) => {
      partialRef.current += delta;
      setTranslationData({
        originalText: '',
        translatedText: partialRef.current,
        fromLanguage: fromLangNameRef.current,
        toLanguage: toLangNameRef.current,
        inputType: 'voice',
        isProcessing: true,
      });
    },
    onError: () => {
      setIsProcessing(false);
    },
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  // Create transforms at top level to avoid conditional hook calls
  const orbTransformX = useTransform(x, [-10, 10], [-5, 5]);
  const orbTransformY = useTransform(y, [-10, 10], [-3, 3]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (currentPage !== 'main') return;
    
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    
    const xPct = (clientX / innerWidth - 0.5) * 2;
    const yPct = (clientY / innerHeight - 0.5) * 2;
    
    x.set(xPct * 8);
    y.set(yPct * 8);
  };

  const handleSignIn = (userData: User) => {
    setUser(userData);
    setCurrentPage('main');
  };

  const handleSignUp = (userData: User) => {
    setUser(userData);
    setCurrentPage('main');
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentPage('signin');
  };

  const handleBackClick = () => {
    if (currentPage === 'settings') {
      setCurrentPage('main');
    } else if (currentPage === 'signin' || currentPage === 'signup') {
      setCurrentPage('main');
    }
  };

  const simulateTranslation = (inputText: string, inputType: 'voice' | 'text') => {
    setIsProcessing(true);
    
    // Set processing state
    setTranslationData({
      originalText: inputText,
      translatedText: '',
      fromLanguage,
      toLanguage,
      inputType,
      isProcessing: true,
    });

    // Simulate translation processing
    setTimeout(() => {
      const translations: Record<string, string> = {
        'Hello, how are you?': 'Hola, ¿cómo estás?',
        'Good morning': 'Buenos días',
        'Thank you': 'Gracias',
        'Where is the bathroom?': '¿Dónde está el baño?',
        'I love you': 'Te amo',
        'What time is it?': '¿Qué hora es?',
        'How much does this cost?': '¿Cuánto cuesta esto?',
        'Can you help me?': '¿Puedes ayudarme?',
        'I don\'t understand': 'No entiendo',
        'Excuse me': 'Disculpe'
      };

      const translatedText = translations[inputText] || 
                           (toLanguage === 'Spanish' ? '¡Hola! ¿Cómo estás?' : 
                            toLanguage === 'French' ? 'Bonjour! Comment allez-vous?' :
                            toLanguage === 'German' ? 'Hallo! Wie geht es dir?' :
                            toLanguage === 'Italian' ? 'Ciao! Come stai?' :
                            toLanguage === 'Portuguese' ? 'Olá! Como está?' :
                            toLanguage === 'Russian' ? 'Привет! Как дела?' :
                            toLanguage === 'Japanese' ? 'こんにちは！元気ですか？' :
                            toLanguage === 'Korean' ? '안녕하세요! 어떻게 지내세요?' :
                            toLanguage === 'Chinese' ? '你好！你好吗？' : 'Hello! How are you?');

      setTranslationData({
        originalText: inputText,
        translatedText,
        fromLanguage,
        toLanguage,
        inputType,
        confidence: 0.85 + Math.random() * 0.15,
        isProcessing: false,
      });

      setIsProcessing(false);
    }, 2000 + Math.random() * 1000);
  };

  // Update backend language preferences when user changes selection
  useEffect(() => {
    fromLangNameRef.current = fromLanguage;
    toLangNameRef.current = toLanguage;
    fromLangCodeRef.current = toLangCode(fromLanguage);
    toLangCodeRef.current = toLangCode(toLanguage);
  }, [fromLanguage, toLanguage]);

  // Start/stop recording when mic toggled
  useEffect(() => {
    const run = async () => {
      if (isListening) {
        partialRef.current = '';
        await connectRtc();
        // Ensure remote audio element is attached to DOM for autoplay policies
        try {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.muted = false;
            // playsInline is supported as an attribute; set via attribute for TS compatibility
            remoteAudioRef.current.setAttribute('playsinline', 'true');
          }
        } catch {}
        setTranslationData({
          originalText: '',
          translatedText: '',
          fromLanguage: fromLangNameRef.current,
          toLanguage: toLangNameRef.current,
          inputType: 'voice',
          isProcessing: true,
        });
      } else {
        await disconnectRtc();
        setTranslationData((prev) => prev ? { ...prev, isProcessing: false } : prev);
      }
    };
    void run();
  }, [isListening, connectRtc, disconnectRtc, remoteAudioRef]);

  // Reset mouse tracking when page changes
  useEffect(() => {
    if (currentPage !== 'main') {
      x.set(0);
      y.set(0);
    }
  }, [currentPage, x, y]);

  const handleTextTranslation = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      setIsProcessing(true);
      setTranslationData({
        originalText: trimmed,
        translatedText: '',
        fromLanguage,
        toLanguage,
        inputType: 'text',
        isProcessing: true,
      });
      const json = await translateTextClient({ text: trimmed, fromLanguage, toLanguage });
      setTranslationData({
        originalText: trimmed,
        translatedText: json.translatedText,
        fromLanguage,
        toLanguage,
        inputType: 'text',
        isProcessing: false,
        confidence: json.confidence,
      });
      if (json.audioUrl) {
        const audio = new Audio(json.audioUrl as string);
        void audio.play();
      }
    } catch (e) {
      console.error(e);
      setTranslationData((prev) => prev ? { ...prev, isProcessing: false } : prev);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearTranslation = () => {
    setTranslationData(null);
    setIsProcessing(false);
  };

  const handleRetryTranslation = () => {
    if (translationData) {
      simulateTranslation(translationData.originalText, translationData.inputType);
    }
  };

  const handleSaveTranslation = () => {
    // In a real app, this would save to backend/local storage
    console.log('Translation saved:', translationData);
  };

  const renderMainPage = () => (
    <div className="flex flex-col min-h-screen" onMouseMove={handleMouseMove}>
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/80 hover:text-white"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </motion.div>
        
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/80 hover:text-white"
              onClick={() => setShowTips(true)}
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/80 hover:text-white"
              onClick={() => setCurrentPage(user ? 'settings' : 'signin')}
            >
              <User className="h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 max-w-screen-sm mx-auto gap-4 sm:gap-8">
        {/* App Logo */}
        <AnimatePresence>
          {!translationData && (
            <motion.div 
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                type: "spring",
                stiffness: 80
              }}
            >
              <VerbioLogo 
                isListening={isListening || isProcessing}
                className="mb-6"
              />
              
              {user && (
                <motion.p
                  className="text-white/70 text-lg mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  Welcome back, {user.name}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translation Result */}
        <TranslationResult 
          translationData={translationData}
          onClear={handleClearTranslation}
          onRetry={handleRetryTranslation}
          onSave={handleSaveTranslation}
        />

        {/* 3D Listening Orb */}
        <motion.div 
          className={`${translationData ? 'mb-6' : 'mb-10'} w-full flex justify-center`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: translationData ? 0.8 : 1,
            y: translationData ? -20 : 0
          }}
          transition={{ 
            duration: 0.8, 
            delay: 0.4,
            type: "spring",
            stiffness: 60,
            damping: 20
          }}
          style={{ x: orbTransformX, y: orbTransformY }}
        >
          <ListeningOrb isListening={isListening} />
        </motion.div>

        {/* Language Selector */}
        <motion.div 
          className={`w-full ${translationData ? 'mb-4' : 'mb-8'}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: translationData ? 0.9 : 1
          }}
          transition={{ 
            duration: 0.8, 
            delay: 0.6,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            y: -5,
            transition: { duration: 0.2 }
          }}
        >
          <LanguageSelector
            fromLanguage={fromLanguage}
            toLanguage={toLanguage}
            onFromLanguageChange={(lang) => {
              setFromLanguage(lang);
              handleClearTranslation();
            }}
            onToLanguageChange={(lang) => {
              setToLanguage(lang);
              handleClearTranslation();
            }}
          />
        </motion.div>

        {/* Audio Controls */}
        <motion.div 
          className={`${translationData ? 'mb-3' : 'mb-6'}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: translationData ? 0.9 : 1
          }}
          transition={{ 
            duration: 0.8, 
            delay: 0.8,
            type: "spring",
            stiffness: 80
          }}
        >
          <AudioControls
            isListening={isListening}
            setIsListening={(listening) => {
              setIsListening(listening);
              if (listening) handleClearTranslation();
            }}
          />
        </motion.div>
      </div>

      {/* Bottom Input */}
      <motion.div 
        className="p-4 sm:p-6 w-full max-w-screen-sm mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: translationData ? 0.95 : 1
        }}
        transition={{ 
          duration: 0.8, 
          delay: 1,
          type: "spring",
          stiffness: 80
        }}
      >
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.01 }}
          whileFocus={{ scale: 1.02 }}
        >
          <Input 
            placeholder="Type to translate instead..."
            className="w-full bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 rounded-2xl py-5 px-5 pr-16 transition-all duration-300 focus:bg-white/25 focus:border-white/50"
            disabled={isListening || isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim() && !isProcessing) {
                handleTextTranslation(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
            {[Mic, Camera, Keyboard].map((Icon, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-white/70 hover:text-white disabled:opacity-50"
                  disabled={isListening || isProcessing}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Tips Popup */}
      <TipsPopup isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );

  // Render different pages
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'signin':
        return (
          <SignIn 
            onSignIn={handleSignIn}
            onSwitchToSignUp={() => setCurrentPage('signup')}
            onBack={() => setCurrentPage('main')}
          />
        );
      case 'signup':
        return (
          <SignUp 
            onSignUp={handleSignUp}
            onSwitchToSignIn={() => setCurrentPage('signin')}
            onBack={() => setCurrentPage('main')}
          />
        );
      case 'settings':
        return (
          <AccountSettings 
            user={user}
            onUpdateUser={setUser}
            onSignOut={handleSignOut}
            onBack={() => setCurrentPage('main')}
          />
        );
      default:
        return renderMainPage();
    }
  };

  const getBackgroundVariant = () => {
    if (currentPage === 'main') return 'main';
    if (currentPage === 'settings') return 'settings';
    return 'auth';
  };

  return (
    <AnimatedBackground 
      isListening={isListening || isProcessing || isConnecting} 
      variant={getBackgroundVariant()}
    >
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50">
        <ConnectionStatus status={isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected'} />
      </div>
      {/* Hidden remote audio tag for WebRTC output */}
      <audio ref={remoteAudioRef as any} className="hidden" />
      {renderCurrentPage()}
    </AnimatedBackground>
  );
}