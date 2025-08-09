import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Copy, Volume2, Star, RotateCcw, Languages, Mic, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranslationData {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  inputType: 'voice' | 'text';
  confidence?: number;
  isProcessing?: boolean;
}

interface TranslationResultProps {
  translationData: TranslationData | null;
  onClear: () => void;
  onRetry: () => void;
  onSave?: () => void;
}

const languageFlags: Record<string, string> = {
  'English': '🇺🇸',
  'Spanish': '🇪🇸',
  'French': '🇫🇷',
  'German': '🇩🇪',
  'Italian': '🇮🇹',
  'Portuguese': '🇵🇹',
  'Russian': '🇷🇺',
  'Japanese': '🇯🇵',
  'Korean': '🇰🇷',
  'Chinese': '🇨🇳',
};

export function TranslationResult({ 
  translationData, 
  onClear, 
  onRetry, 
  onSave 
}: TranslationResultProps) {
  // keep state for potential expansion UX (avoid unused var error)
  const [isExpanded, setIsExpanded] = useState(false);
  void isExpanded;
  const [isSaved, setIsSaved] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  useEffect(() => {
    if (translationData?.isProcessing) {
      setShowProcessing(true);
      setIsExpanded(false);
    } else if (translationData && !translationData.isProcessing) {
      setShowProcessing(false);
      // Small delay to show the result after processing
      setTimeout(() => setIsExpanded(true), 300);
    }
  }, [translationData]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSpeak = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'Spanish' ? 'es-ES' : 
                      language === 'French' ? 'fr-FR' :
                      language === 'German' ? 'de-DE' :
                      language === 'Japanese' ? 'ja-JP' :
                      language === 'Chinese' ? 'zh-CN' :
                      language === 'Korean' ? 'ko-KR' :
                      language === 'Italian' ? 'it-IT' :
                      language === 'Portuguese' ? 'pt-PT' :
                      language === 'Russian' ? 'ru-RU' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    onSave?.();
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!translationData) return null;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {/* Processing State */}
        {showProcessing && (
          <motion.div
            key="processing"
            className="w-full mx-auto mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.6, 
              type: "spring", 
              stiffness: 120, 
              damping: 20 
            }}
          >
            <Card className="bg-white/20 backdrop-blur-md border-white/30 p-4 sm:p-6 rounded-2xl">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <motion.div
                  className="w-2.5 h-2.5 bg-purple-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: 0 
                  }}
                />
                <motion.div
                  className="w-2.5 h-2.5 bg-pink-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: 0.2 
                  }}
                />
                <motion.div
                  className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: 0.4 
                  }}
                />
              </div>
              <motion.p 
                className="text-white/80 text-center text-sm"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Processing translation...
              </motion.p>
            </Card>
          </motion.div>
        )}

        {/* Translation Result */}
        {!showProcessing && (
          <motion.div
            key="result"
            className="w-full mx-auto mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ 
              duration: 0.7, 
              type: "spring", 
              stiffness: 100, 
              damping: 20 
            }}
          >
            <Card className="bg-white/20 backdrop-blur-xl border-white/30 overflow-hidden shadow-xl rounded-2xl">
              {/* Header with Action Buttons */}
              <motion.div 
                className="flex items-center justify-between p-3 sm:p-4 border-b border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Languages className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm">Translation Complete</p>
                    {translationData.confidence && (
                      <p className="text-white/60 text-xs">
                        {Math.round(translationData.confidence * 100)}% confidence
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onRetry}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 rounded-full"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSave}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 rounded-full"
                    >
                      <Star className={`h-3.5 w-3.5 ${isSaved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Original Text Pill */}
              <motion.div 
                className="p-4 sm:p-5 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${translationData.inputType === 'voice' 
                          ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' 
                          : 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                        } px-3 py-1 text-xs
                      `}
                    >
                      {translationData.inputType === 'voice' ? (
                        <Mic className="h-3 w-3 mr-1" />
                      ) : (
                        <Type className="h-3 w-3 mr-1" />
                      )}
                      {languageFlags[translationData.fromLanguage]} {translationData.fromLanguage}
                    </Badge>
                    
                    <div className="flex space-x-1 flex-shrink-0">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(translationData.originalText)}
                          className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/20 rounded-full"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSpeak(translationData.originalText, translationData.fromLanguage)}
                          className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/20 rounded-full"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    className="bg-white/10 rounded-2xl p-4 border border-white/20 hover:bg-white/15"
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-white text-base leading-relaxed break-words">
                      {translationData.originalText}
                    </p>
                  </motion.div>
                </div>

                {/* Arrow Separator */}
                <motion.div 
                  className="flex justify-center py-2"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Languages className="h-5 w-5 text-white" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Translated Text Pill */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className="bg-green-500/20 text-green-200 border-green-500/30 px-3 py-1 text-xs"
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      {languageFlags[translationData.toLanguage]} {translationData.toLanguage}
                    </Badge>
                    
                    <div className="flex space-x-1 flex-shrink-0">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(translationData.translatedText)}
                          className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/20 rounded-full"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSpeak(translationData.translatedText, translationData.toLanguage)}
                          className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/20 rounded-full"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    className="bg-gradient-to-br from-white/15 to-white/10 rounded-2xl p-4 border border-white/30 shadow-inner"
                    whileHover={{ 
                      background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.15))",
                      scale: 1.02
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.p 
                      className="text-white text-base leading-relaxed font-medium break-words"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {translationData.translatedText}
                    </motion.p>
                  </motion.div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  className="flex justify-center space-x-3 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={onClear}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-full px-6 text-sm"
                    >
                      New Translation
                    </Button>
                  </motion.div>
                  
                  {onSave && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 shadow-lg text-sm"
                      >
                        {isSaved ? 'Saved!' : 'Save Translation'}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </Card>

            {/* Floating Particles Around Result */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400/60 to-pink-400/60 rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    x: [0, Math.random() * 30 - 15],
                    y: [0, Math.random() * 30 - 15],
                    scale: [0, 1.2, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}