import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface LanguageSelectorProps {
  fromLanguage: string;
  toLanguage: string;
  onFromLanguageChange: (language: string) => void;
  onToLanguageChange: (language: string) => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export function LanguageSelector({
  fromLanguage,
  toLanguage,
  onFromLanguageChange,
  onToLanguageChange,
}: LanguageSelectorProps) {
  const fromLang = languages.find(lang => lang.name === fromLanguage);
  const toLang = languages.find(lang => lang.name === toLanguage);

  const handleSwapLanguages = () => {
    onFromLanguageChange(toLanguage);
    onToLanguageChange(fromLanguage);
  };

  return (
    <motion.div 
      className="bg-white/25 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-2xl"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* From Language */}
        <div className="flex-1 min-w-0">
          <label className="block text-white/80 text-sm mb-2 font-medium">From</label>
          <Select value={fromLanguage} onValueChange={onFromLanguageChange}>
            <SelectTrigger className="bg-transparent border-none text-white hover:bg-white/10 focus:bg-white/15 h-12 rounded-2xl w-full">
              <SelectValue>
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-xl flex-shrink-0">{fromLang?.flag}</span>
                  <span className="font-semibold text-base truncate">{fromLanguage}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border-white/30 rounded-2xl">
              {languages.map((language) => (
                <SelectItem 
                  key={language.code} 
                  value={language.name}
                  className="hover:bg-purple-100/50 focus:bg-purple-100/50 rounded-xl mb-1 last:mb-0"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <span className="font-medium">{language.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Swap Button */}
        <motion.div
          className="flex-shrink-0 flex items-end pb-0"
          whileHover={{ scale: 1.15, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapLanguages}
            className="rounded-full bg-white/30 hover:bg-white/40 text-white border border-white/40 h-12 w-12 shadow-lg flex-shrink-0"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* To Language */}
        <div className="flex-1 min-w-0">
          <label className="block text-white/80 text-sm mb-2 font-medium">To</label>
          <Select value={toLanguage} onValueChange={onToLanguageChange}>
            <SelectTrigger className="bg-transparent border-none text-white hover:bg-white/10 focus:bg-white/15 h-12 rounded-2xl w-full">
              <SelectValue>
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-xl flex-shrink-0">{toLang?.flag}</span>
                  <span className="font-semibold text-base truncate">{toLanguage}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-md border-white/30 rounded-2xl">
              {languages.map((language) => (
                <SelectItem 
                  key={language.code} 
                  value={language.name}
                  className="hover:bg-purple-100/50 focus:bg-purple-100/50 rounded-xl mb-1 last:mb-0"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <span className="font-medium">{language.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}