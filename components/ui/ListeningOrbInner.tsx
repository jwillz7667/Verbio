"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function ListeningOrbInner({
  level,
  state,
}: {
  level: number; // 0..1
  state: "idle" | "listening" | "translating";
}) {
  const clamped = Math.max(0, Math.min(1, level || 0));
  const lvl = useSpring(clamped, { stiffness: 180, damping: 24, mass: 0.6 });
  useEffect(() => {
    lvl.set(clamped);
  }, [clamped, lvl]);

  const scale = useTransform(lvl, [0, 1], [1, 1.12]);
  const glow = useTransform(lvl, [0, 1], [0.35, 0.8]);

  return (
    <div className="relative grid place-items-center py-8">
      {/* Halo dots */}
      <motion.div className="absolute" style={{ scale }}>
        <DotsRing intensity={state === "translating" ? 1 : 0.6} />
      </motion.div>

      {/* The orb */}
      <motion.div
        aria-label={state === "listening" ? "Listening" : state === "translating" ? "Translating" : "Idle"}
        className="relative h-48 w-48 rounded-full"
        style={{ scale }}
      >
        <div className="absolute inset-0 rounded-full orb-iris" />
        <div className="absolute inset-0 rounded-full mix-blend-screen orb-spec" />
        <motion.div className="absolute -inset-2 rounded-full blur-2xl" style={{ opacity: glow }}>
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,.6),rgba(236,72,153,.35))]" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function DotsRing({ intensity = 0.6 }: { intensity?: number }) {
  const dots = Array.from({ length: 20 });
  return (
    <div className="relative h-60 w-60">
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const x = Math.cos(angle) * 110 + 120; // center about 120
        const y = Math.sin(angle) * 110 + 120;
        return (
          <motion.span
            key={i}
            className="absolute h-3 w-3 rounded-full"
            style={{ left: x, top: y, background: "rgba(236,72,153,0.8)" }}
            animate={{ opacity: [0.3 * intensity, 1 * intensity, 0.3 * intensity], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.4, delay: i * 0.06, repeat: Infinity }}
          />
        );
      })}
    </div>
  );
}




