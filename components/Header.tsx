"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Github } from "lucide-react";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { UserMenu } from "@/components/UserMenu";

export function Header({
  status,
}: {
  status: "disconnected" | "connecting" | "connected" | "error";
}) {
  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="mx-auto mt-3 w-[min(1200px,100%-1rem)] flex h-14 items-center justify-between rounded-2xl border border-black/5 bg-white/60 px-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
        <Link href="/" className="flex items-center gap-3">
          {/* Light theme logo */}
          <Image
            src="/brand/VERBIO-dark-trans.svg"
            alt="Verbio"
            width={120}
            height={28}
            className="hidden dark:block h-auto w-auto"
            priority
          />
          {/* Dark theme logo (for dark backgrounds) */}
          <Image
            src="/brand/verbio-logo-light-trans.svg"
            alt="Verbio"
            width={120}
            height={28}
            className="block dark:hidden h-auto w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ConnectionStatus status={status} />
          <ThemeToggle />
          <UserMenu />
          <a
            href="https://github.com/jwillz7667/Verbio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}


