import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { gsap } from 'gsap';

interface ListeningOrbProps {
  isListening: boolean;
}

export function ListeningOrb({ isListening }: ListeningOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { stiffness: 150, damping: 25, restDelta: 0.001 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  // Generate 3D particle positions for spherical orbit with physics
  const particles = Array.from({ length: 48 }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / 48);
    const theta = Math.sqrt(48 * Math.PI) * phi;
    return {
      id: i,
      phi,
      theta,
      radius: 160,
      delay: i * 0.03,
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi),
      velocity: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      }
    };
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced particle system with GSAP
      particles.forEach((particle, i) => {
        void particle;
        if (particleSystemRef.current?.children && particleSystemRef.current.children[i]) {
          const particleEl = particleSystemRef.current.children[i] as HTMLElement;

          if (isListening) {
            // Chaotic particle behavior when listening
            gsap.to(particleEl, {
              duration: "random(1, 3)",
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              scale: "random(0.5, 3)",
              opacity: "random(0.4, 1)",
              rotation: "random(0, 360)",
            });

            // Pulsing glow effect
            gsap.to(particleEl, {
              boxShadow: `0 0 ${10 + Math.random() * 20}px hsl(${280 + Math.random() * 80}, 80%, 70%)`,
              duration: "random(0.5, 1.5)",
              repeat: -1,
              yoyo: true,
              ease: "power2.inOut"
            });
          } else {
            // Calm orbital motion when idle
            gsap.to(particleEl, {
              duration: "random(8, 15)",
              repeat: -1,
              ease: "none",
              rotation: 360,
              transformOrigin: "center center"
            });

            gsap.to(particleEl, {
              scale: "random(0.3, 1.2)",
              opacity: "random(0.2, 0.8)",
              duration: "random(2, 4)",
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            });
          }
        }
      });

      // Enhanced orb animations
      if (orbRef.current) {
        if (isListening) {
          gsap.to(orbRef.current, {
            filter: "hue-rotate(60deg) saturate(1.5) brightness(1.2)",
            duration: 0.8,
            ease: "power2.out"
          });

          // Create energy waves
          const waves = orbRef.current.querySelectorAll('.energy-wave');
          if (waves.length > 0) {
            waves.forEach((wave, i) => {
              gsap.fromTo(wave, 
                { scale: 0.8, opacity: 0.8 },
                { 
                  scale: 2.5,
                  opacity: 0,
                  duration: 1.5,
                  repeat: -1,
                  ease: "power2.out",
                  delay: i * 0.3
                }
              );
            });
          }
        } else {
          gsap.to(orbRef.current, {
            filter: "hue-rotate(0deg) saturate(1) brightness(1)",
            duration: 1.2,
            ease: "power2.out"
          });
        }
      }
    }, orbRef);

    return () => ctx.revert();
  }, [isListening, particles]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.div 
      className="relative flex items-center justify-center perspective-1000" 
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      {/* 3D Particle Sphere */}
      <div ref={particleSystemRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {particles.map((particle) => {
          const x = particle.x * particle.radius;
          const y = particle.y * particle.radius;
          const z = particle.z * (particle.radius * 0.6);
          
          return (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: 'center center',
                background: `linear-gradient(45deg, 
                  hsl(${280 + particle.z * 60}, 70%, ${60 + particle.z * 25}%), 
                  hsl(${320 + particle.z * 40}, 85%, ${70 + particle.z * 20}%))`,
                boxShadow: `0 0 ${6 + particle.z * 10}px hsl(${300 + particle.z * 50}, 85%, 75%)`,
              }}
              initial={{
                x: x * 0.7,
                y: y * 0.7,
                z: z * 0.7,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: x * (isListening ? 1.4 : 1),
                y: y * (isListening ? 1.4 : 1),
                z: z * (isListening ? 1.4 : 1),
                scale: isListening ? [0.5, 2.5, 0.5] : [0.3, 1.5, 0.3],
                opacity: isListening ? [0.4, 1, 0.4] : [0.3, 0.9, 0.3],
                rotateY: 360,
                rotateX: particle.z * 180,
              }}
              transition={{
                duration: isListening ? 2 : 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: particle.delay,
                rotateY: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                },
                rotateX: {
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              }}
            />
          );
        })}
      </div>

      {/* Main Sphere Container */}
      <motion.div 
        ref={orbRef}
        className="relative w-64 h-64"
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
        }}
        animate={{
          rotateZ: [0, 360],
        }}
        transition={{
          rotateZ: {
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }
        }}
      >
        {/* Energy Waves for Listening State */}
        {isListening && (
          <>
            <div className="energy-wave absolute inset-0 rounded-full border-2 border-purple-400/40" />
            <div className="energy-wave absolute inset-0 rounded-full border-2 border-pink-400/30" />
            <div className="energy-wave absolute inset-0 rounded-full border-2 border-blue-400/25" />
          </>
        )}

        {/* Sphere Back Layer */}
        <motion.div
          className="absolute inset-8 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 35% 35%, rgba(147, 51, 234, 0.9), rgba(59, 130, 246, 0.7), rgba(168, 85, 247, 0.5))',
            filter: 'blur(4px)',
            transform: 'translateZ(-50px)',
          }}
          animate={{
            scale: isListening ? [1, 1.15, 1] : [1, 1.08, 1],
          }}
          transition={{
            duration: isListening ? 1.8 : 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Sphere Mid Layer */}
        <motion.div
          className="absolute inset-6 rounded-full opacity-50"
          style={{
            background: 'radial-gradient(ellipse at 30% 30%, rgba(236, 72, 153, 0.95), rgba(147, 51, 234, 0.8), rgba(59, 130, 246, 0.6))',
            filter: 'blur(3px)',
            transform: 'translateZ(-25px)',
            boxShadow: 'inset 0 0 60px rgba(147, 51, 234, 0.4)',
          }}
          animate={{
            scale: isListening ? [1, 1.2, 1] : [1, 1.1, 1],
            rotate: isListening ? [0, 360] : [0, 180],
          }}
          transition={{
            scale: {
              duration: isListening ? 1.5 : 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: isListening ? 15 : 30,
              repeat: Infinity,
              ease: "linear",
            }
          }}
        />

        {/* Main Sphere Surface */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse at 25% 25%, 
                rgba(255, 255, 255, 0.9) 0%,
                rgba(236, 72, 153, 0.7) 15%,
                rgba(147, 51, 234, 0.9) 45%,
                rgba(59, 130, 246, 0.7) 75%,
                rgba(30, 41, 59, 0.95) 100%
              )
            `,
            boxShadow: `
              inset 25px 25px 80px rgba(147, 51, 234, 0.4),
              inset -25px -25px 80px rgba(59, 130, 246, 0.4),
              0 0 100px rgba(147, 51, 234, 0.7),
              0 0 150px rgba(236, 72, 153, 0.5)
            `,
            border: '3px solid rgba(255, 255, 255, 0.4)',
            transform: 'translateZ(0px)',
          }}
          animate={{
            scale: isListening ? [1, 1.25, 1] : [1, 1.12, 1],
          }}
          transition={{
            duration: isListening ? 1.2 : 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Primary Highlight */}
        <motion.div
          className="absolute top-10 left-16 w-20 h-20 rounded-full opacity-85"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 60%, transparent 100%)',
            filter: 'blur(8px)',
            transform: 'translateZ(15px)',
          }}
          animate={{
            scale: isListening ? [1, 1.6, 1] : [1, 1.3, 1],
            x: isListening ? [0, 20, 0] : [0, 12, 0],
            y: isListening ? [0, -12, 0] : [0, -6, 0],
            opacity: isListening ? [0.85, 1, 0.85] : [0.7, 0.95, 0.7],
          }}
          transition={{
            duration: isListening ? 2 : 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary Highlights */}
        <motion.div
          className="absolute top-20 left-12 w-12 h-12 rounded-full opacity-70"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.2) 70%, transparent 100%)',
            filter: 'blur(4px)',
            transform: 'translateZ(20px)',
          }}
          animate={{
            scale: isListening ? [1, 1.8, 1] : [1, 1.4, 1],
            opacity: isListening ? [0.7, 1, 0.7] : [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: isListening ? 1.5 : 3.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Tertiary Highlight */}
        <motion.div
          className="absolute top-16 left-20 w-8 h-8 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 80%)',
            filter: 'blur(2px)',
            transform: 'translateZ(25px)',
          }}
          animate={{
            scale: isListening ? [1, 2, 1] : [1, 1.5, 1],
            opacity: isListening ? [0.6, 1, 0.6] : [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: isListening ? 1.3 : 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner Core Glow */}
        <motion.div
          className="absolute inset-16 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(236, 72, 153, 0.4) 40%, transparent 100%)',
            filter: 'blur(15px)',
            transform: 'translateZ(8px)',
          }}
          animate={{
            opacity: isListening ? [0.5, 1, 0.5] : [0.3, 0.7, 0.3],
            scale: isListening ? [1, 1.8, 1] : [1, 1.4, 1],
          }}
          transition={{
            duration: isListening ? 1 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Enhanced Outer Atmospheric Effects */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, rgba(236, 72, 153, 0.3) 30%, rgba(59, 130, 246, 0.2) 60%, transparent 80%)',
          filter: 'blur(50px)',
        }}
        animate={{
          scale: isListening ? [1, 1.8, 1] : [1, 1.4, 1],
          opacity: isListening ? [0.4, 0.9, 0.4] : [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: isListening ? 2.5 : 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Dynamic Energy Rings */}
      {isListening && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-purple-400/20"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ 
                scale: [1, 3 + i * 0.5, 5 + i], 
                opacity: [0.8, 0.3, 0],
                rotate: (i % 2 === 0 ? 360 : -360)
              }}
              transition={{ 
                duration: 2.5 + i * 0.3, 
                repeat: Infinity, 
                ease: "easeOut",
                delay: i * 0.4,
                rotate: { duration: 8 + i * 2, ease: "linear" }
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}