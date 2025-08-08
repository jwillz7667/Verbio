import React from 'react';
import { motion } from 'framer-motion';
import { Languages, Mic } from 'lucide-react';

interface VerbioLogoProps {
  isListening?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function VerbioLogo({ isListening = false, style, className }: VerbioLogoProps) {
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      style={style}
    >
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        animate={{
          background: isListening 
            ? [
                "radial-gradient(ellipse at center, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.2) 50%, transparent 70%)",
                "radial-gradient(ellipse at center, rgba(236,72,153,0.4) 0%, rgba(59,130,246,0.3) 50%, transparent 70%)",
                "radial-gradient(ellipse at center, rgba(59,130,246,0.3) 0%, rgba(168,85,247,0.2) 50%, transparent 70%)"
              ]
            : "radial-gradient(ellipse at center, rgba(168,85,247,0.2) 0%, rgba(236,72,153,0.1) 50%, transparent 70%)"
        }}
        transition={{
          duration: isListening ? 2 : 1,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Main Logo Container */}
      <div className="relative flex items-center space-x-4">
        {/* Left Sound Waves */}
        <div className="flex items-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`left-${i}`}
              className="w-1 bg-gradient-to-t from-purple-400 via-pink-400 to-blue-400 rounded-full"
              animate={{
                height: isListening 
                  ? [12 + i * 8, 20 + i * 12, 12 + i * 8]
                  : 8 + i * 4,
                opacity: isListening ? [0.6, 1, 0.6] : 0.7
              }}
              transition={{
                duration: 1.2,
                repeat: isListening ? Infinity : 0,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Center Logo Icon */}
        <motion.div
          className="relative"
          animate={{
            rotate: isListening ? [0, 10, -10, 0] : 0,
            scale: isListening ? [1, 1.1, 1] : 1
          }}
          transition={{
            duration: 2,
            repeat: isListening ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <motion.div
              animate={{
                color: isListening 
                  ? ["#a855f7", "#ec4899", "#3b82f6", "#a855f7"]
                  : "#ffffff"
              }}
              transition={{
                duration: 2,
                repeat: isListening ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <Languages className="h-6 w-6" />
            </motion.div>
          </div>
          
          {/* Floating Microphone Icon */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              y: isListening ? [0, -4, 0] : 0,
              rotate: isListening ? [0, 15, -15, 0] : 0,
              opacity: isListening ? 1 : 0.7
            }}
            transition={{
              duration: 1.5,
              repeat: isListening ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-md">
              <Mic className="h-3 w-3 text-white" />
            </div>
          </motion.div>
        </motion.div>

        {/* Verbio Text */}
        <motion.div className="flex flex-col items-center">
          <motion.h1
            className="text-5xl tracking-wider font-light relative"
            animate={{
              background: isListening
                ? [
                    "linear-gradient(45deg, #a855f7, #ec4899, #3b82f6)",
                    "linear-gradient(45deg, #ec4899, #3b82f6, #a855f7)",
                    "linear-gradient(45deg, #3b82f6, #a855f7, #ec4899)"
                  ]
                : "linear-gradient(45deg, #ffffff, #e5e7eb, #ffffff)",
              backgroundSize: "200% 200%",
              backgroundPosition: isListening ? ["0% 50%", "100% 50%", "0% 50%"] : "50% 50%"
            }}
            style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
              letterSpacing: '0.1em'
            }}
            transition={{
              duration: isListening ? 3 : 2,
              repeat: isListening ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            Verbio
          </motion.h1>
          
          {/* Subtitle */}
          <motion.div
            className="flex items-center space-x-2 mt-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="w-3 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              animate={{
                scaleX: isListening ? [1, 1.5, 1] : 1,
                opacity: isListening ? [0.6, 1, 0.6] : 0.8
              }}
              transition={{
                duration: 1.5,
                repeat: isListening ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            <span className="text-white/60 text-xs font-medium tracking-wider uppercase">
              Voice Translation
            </span>
            <motion.div
              className="w-3 h-0.5 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full"
              animate={{
                scaleX: isListening ? [1, 1.5, 1] : 1,
                opacity: isListening ? [0.6, 1, 0.6] : 0.8
              }}
              transition={{
                duration: 1.5,
                repeat: isListening ? Infinity : 0,
                ease: "easeInOut",
                delay: 0.3
              }}
            />
          </motion.div>
        </motion.div>

        {/* Right Sound Waves */}
        <div className="flex items-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`right-${i}`}
              className="w-1 bg-gradient-to-t from-blue-400 via-pink-400 to-purple-400 rounded-full"
              animate={{
                height: isListening 
                  ? [12 + (2-i) * 8, 20 + (2-i) * 12, 12 + (2-i) * 8]
                  : 8 + (2-i) * 4,
                opacity: isListening ? [0.6, 1, 0.6] : 0.7
              }}
              transition={{
                duration: 1.2,
                repeat: isListening ? Infinity : 0,
                delay: i * 0.2 + 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Particles */}
      {isListening && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: `linear-gradient(45deg, ${
                  i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#ec4899' : '#3b82f6'
                }, transparent)`,
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Pulsing Ring Effect */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/20"
        animate={{
          scale: isListening ? [1, 1.2, 1] : 1,
          opacity: isListening ? [0.3, 0.6, 0.3] : 0.2
        }}
        transition={{
          duration: 2,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}