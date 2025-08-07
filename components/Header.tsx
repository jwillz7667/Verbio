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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/vercel.svg"
            alt="Verbio"
            width={24}
            height={24}
            className="opacity-90"
          />
          <span className="text-lg font-semibold tracking-tight">Verbio</span>
        </Link>
        <div className="flex items-center gap-3">
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


