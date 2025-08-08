import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';

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
  const backgroundRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9]);

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
          particles: isListening ? 'bg-white/50' : 'bg-white/30',
          blur: isListening ? 'backdrop-blur-2xl' : 'backdrop-blur-xl'
        };
      case 'settings':
        return {
          base: isListening 
            ? 'from-indigo-300/70 via-purple-200/50 to-cyan-300/70'
            : 'from-indigo-200/50 via-purple-100/30 to-cyan-200/50',
          secondary: isListening
            ? 'from-cyan-200/50 via-indigo-200/30 to-purple-300/50'
            : 'from-cyan-100/30 via-indigo-100/20 to-purple-200/30',
          particles: isListening ? 'bg-white/40' : 'bg-white/25',
          blur: isListening ? 'backdrop-blur-xl' : 'backdrop-blur-lg'
        };
      default: // main
        return {
          base: isListening 
            ? 'from-purple-400/90 via-pink-300/70 to-blue-400/90'
            : 'from-purple-300/70 via-pink-200/50 to-blue-300/70',
          secondary: isListening
            ? 'from-blue-300/70 via-purple-300/50 to-pink-400/70'
            : 'from-blue-200/50 via-purple-200/30 to-pink-300/50',
          particles: isListening ? 'bg-white/40' : 'bg-white/25',
          blur: isListening ? 'backdrop-blur-3xl' : 'backdrop-blur-2xl'
        };
    }
  };

  const colors = getColorScheme();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (backgroundRef.current) {
        gsap.set(backgroundRef.current, { opacity: 0 });
        
        gsap.to(backgroundRef.current, {
          opacity: 1,
          duration: 1.5,
          ease: "power2.out"
        });
      }

      // Floating background elements
      const bgGradient1 = containerRef.current?.querySelector(".bg-gradient-1");
      const bgGradient2 = containerRef.current?.querySelector(".bg-gradient-2");
      
      if (bgGradient1) {
        gsap.to(bgGradient1, {
          x: "random(-30, 30)",
          y: "random(-20, 20)",
          rotation: "random(-10, 10)",
          duration: "random(12, 20)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      if (bgGradient2) {
        gsap.to(bgGradient2, {
          x: "random(-20, 20)",
          y: "random(-30, 30)", 
          rotation: "random(-8, 8)",
          duration: "random(15, 25)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      // Create floating particles
      if (particlesRef.current) {
        const particles = [];
        const particleCount = variant === 'main' ? 25 : 15;
        
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = `particle absolute w-1 h-1 ${colors.particles} rounded-full`;
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          particlesRef.current.appendChild(particle);
          particles.push(particle);

          gsap.to(particle, {
            x: `random(-150, 150)`,
            y: `random(-150, 150)`,
            opacity: "random(0.2, 0.8)",
            scale: "random(0.5, 1.5)",
            duration: "random(20, 35)",
            repeat: -1,
            yoyo: true,
            ease: "none"
          });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [variant, colors.particles]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (isListening) {
        if (backgroundRef.current) {
          gsap.to(backgroundRef.current, {
            filter: "hue-rotate(20deg) saturate(1.4) brightness(1.1)",
            duration: 0.6,
            ease: "power2.out"
          });
        }

        const particles = containerRef.current?.querySelectorAll(".particle");
        if (particles && particles.length > 0) {
          gsap.to(particles, {
            scale: "random(1.2, 2.5)",
            opacity: "random(0.5, 1)",
            duration: 0.8,
            stagger: 0.03,
            ease: "back.out(1.4)"
          });
        }
      } else {
        if (backgroundRef.current) {
          gsap.to(backgroundRef.current, {
            filter: "hue-rotate(0deg) saturate(1) brightness(1)",
            duration: 1,
            ease: "power2.out"
          });
        }

        const particles = containerRef.current?.querySelectorAll(".particle");
        if (particles && particles.length > 0) {
          gsap.to(particles, {
            scale: "random(0.5, 1.2)",
            opacity: "random(0.2, 0.7)",
            duration: 1.2,
            stagger: 0.02,
            ease: "power2.out"
          });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isListening]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <motion.div 
        ref={backgroundRef}
        className="absolute inset-0"
        style={{ opacity }}
      >
        <motion.div 
          className={`bg-gradient-1 absolute inset-0 bg-gradient-to-br ${colors.base}`}
          style={{ x: y1 }}
        />
        <motion.div 
          className={`bg-gradient-2 absolute inset-0 bg-gradient-to-tr ${colors.secondary}`}
          style={{ x: y2 }}
          animate={{
            background: isListening ? [
              "linear-gradient(45deg, rgb(147, 51, 234, 0.8), rgb(168, 85, 247, 0.6), rgb(236, 72, 153, 0.8))",
              "linear-gradient(45deg, rgb(236, 72, 153, 0.6), rgb(139, 92, 246, 0.8), rgb(147, 51, 234, 0.6))",
              "linear-gradient(45deg, rgb(139, 92, 246, 0.8), rgb(147, 51, 234, 0.6), rgb(236, 72, 153, 0.8))"
            ] : [
              "linear-gradient(45deg, rgb(147, 51, 234, 0.5), rgb(168, 85, 247, 0.3), rgb(236, 72, 153, 0.5))",
              "linear-gradient(45deg, rgb(236, 72, 153, 0.3), rgb(139, 92, 246, 0.5), rgb(147, 51, 234, 0.3))",
              "linear-gradient(45deg, rgb(139, 92, 246, 0.5), rgb(147, 51, 234, 0.3), rgb(236, 72, 153, 0.5))"
            ]
          }}
          transition={{
            duration: isListening ? 6 : 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className={`absolute inset-0 ${colors.blur}`}
          animate={{
            backdropFilter: isListening 
              ? ["blur(15px)", "blur(30px)", "blur(15px)"]
              : variant === 'main' ? "blur(20px)" : "blur(15px)"
          }}
          transition={{
            duration: isListening ? 2 : 1,
            repeat: isListening ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating Particles */}
        <div ref={particlesRef} className="absolute inset-0" />
        
        {/* Animated Mesh Gradient Overlays */}
        <motion.div
          className={`absolute top-0 right-0 w-96 h-96 bg-gradient-radial ${
            isListening ? 'from-purple-400/30' : 'from-purple-300/15'
          } to-transparent rounded-full blur-3xl`}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial ${
            isListening ? 'from-pink-400/25' : 'from-pink-300/12'
          } to-transparent rounded-full blur-3xl`}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}