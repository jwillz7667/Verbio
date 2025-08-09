"use client";

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedBackgroundProps {
  isListening?: boolean;
  variant?: 'main' | 'auth' | 'settings';
  children?: React.ReactNode;
}

export function AnimatedBackground({ 
  isListening = false, 
  variant = 'main',
  children 
}: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Different color schemes for different variants
  const getColorScheme = () => {
    switch (variant) {
      case 'auth':
        return {
          base: isListening 
            ? 'from-purple-300/80 via-pink-200/60 to-blue-300/80'
            : 'from-purple-200/60 via-pink-100/40 to-blue-200/60',
          secondary: isListening
            ? 'from-blue-200/60 via-purple-200/40 to-pink-300/60'
            : 'from-blue-100/40 via-purple-100/30 to-pink-200/40',
        };
      case 'settings':
        return {
          base: isListening 
            ? 'from-indigo-300/70 via-purple-200/50 to-cyan-300/70'
            : 'from-indigo-200/50 via-purple-100/30 to-cyan-200/50',
          secondary: isListening
            ? 'from-cyan-200/50 via-indigo-200/30 to-purple-300/50'
            : 'from-cyan-100/30 via-indigo-100/20 to-purple-200/30',
        };
      default: // main
        return {
          base: isListening 
            ? 'from-purple-400/90 via-pink-300/70 to-blue-400/90'
            : 'from-purple-300/70 via-pink-200/50 to-blue-300/70',
          secondary: isListening
            ? 'from-blue-300/70 via-purple-300/50 to-pink-400/70'
            : 'from-blue-200/50 via-purple-200/30 to-pink-300/50',
        };
    }
  };

  const colors = getColorScheme();

  // Generate particle positions after mount to avoid hydration mismatch
  const particlePositions = useRef<Array<{ left: number; top: number; delay: number }>>([]);
  
  useEffect(() => {
    setMounted(true);
    // Generate random positions only on client side
    particlePositions.current = Array.from({ length: 10 }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: i * 0.5
    }));
  }, []);

  // Use CSS animations instead of JS for better performance
  useEffect(() => {
    if (containerRef.current) {
      // Toggle animation class based on listening state
      if (isListening) {
        containerRef.current.classList.add('listening-active');
      } else {
        containerRef.current.classList.remove('listening-active');
      }
    }
  }, [isListening]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden animated-bg-container"
    >
      {/* CSS-animated Gradient Background */}
      <div className="absolute inset-0">
        {/* Primary gradient */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${colors.base} animate-gradient-shift`}
          style={{
            animation: 'gradientShift 15s ease infinite',
            willChange: 'transform'
          }}
        />
        
        {/* Secondary gradient overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-tr ${colors.secondary} opacity-50`}
          style={{
            animation: 'gradientShift 20s ease infinite reverse',
            willChange: 'transform'
          }}
        />
        
        {/* Blur overlay */}
        <div 
          className={`absolute inset-0 backdrop-blur-xl transition-all duration-1000 ${
            isListening ? 'backdrop-blur-2xl' : 'backdrop-blur-xl'
          }`}
        />
        
        {/* CSS-only floating orbs for performance */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float-fast" />
        
        {/* CSS particles - only render after mount to avoid hydration issues */}
        {mounted && (
          <div className="particles-container absolute inset-0">
            {particlePositions.current.map((pos, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  animation: `particle-float ${15 + i * 2}s linear infinite`,
                  animationDelay: `${pos.delay}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, -40px) scale(1.1);
          }
        }

        @keyframes float-medium {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -20px) scale(0.9);
          }
        }

        @keyframes float-fast {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(calc(-50% + 20px), calc(-50% - 30px)) scale(1.05);
          }
        }

        @keyframes particle-float {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translate(100px, -100vh) scale(0.5);
            opacity: 0;
          }
        }

        .animate-gradient-shift {
          animation: gradientShift 15s ease infinite;
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 15s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite;
        }

        .listening-active .particle {
          animation-duration: 10s !important;
          opacity: 0.8 !important;
        }

        .listening-active .animate-float-slow,
        .listening-active .animate-float-medium,
        .listening-active .animate-float-fast {
          animation-duration: 8s !important;
        }
      `}</style>
    </div>
  );
}