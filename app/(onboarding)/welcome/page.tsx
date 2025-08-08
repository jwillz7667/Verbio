"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Welcome() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-0 left-0 w-[600px] h-[600px] opacity-25" />
        <div className="blob absolute bottom-0 right-0 w-[800px] h-[800px] opacity-20" style={{ animationDelay: '10s' }} />
      </div>

      <div className="container mx-auto max-w-3xl px-6 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-4xl font-extrabold tracking-tight"
        >
          Hello, I’m <span className="glow-text">Verbio</span> 👋
        </motion.h1>
        <p className="mt-3 text-black/70 dark:text-white/70">
          Your AI language buddy to translate, chat, and practice with ease.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Card title="Real-time voice translator" desc="Speak and I’ll translate instantly." />
          <Card title="Snap & Translate" desc="Camera and gallery OCR for signs and menus." />
          <Card title="Practice through chat" desc="Role-play scenarios with speech grading." />
          <Card title="Fun facts & tips" desc="Bite-sized learnings to keep you curious." />
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-brand-gradient px-6 py-3 text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          Get Started →
        </Link>
      </div>
    </main>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-4 text-left shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
      <p className="font-semibold text-black/80 dark:text-white/90">{title}</p>
      <p className="mt-1 text-sm text-black/60 dark:text-white/70">{desc}</p>
    </div>
  );
}


