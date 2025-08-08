"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Settings, Info } from "lucide-react";

type DockItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: DockItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/terms", label: "Terms", icon: Info },
  { href: "/privacy", label: "Privacy", icon: Settings },
];

export function Dock() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[min(640px,calc(100%-24px))] rounded-2xl border border-black/5 bg-white/70 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-black/40"
    >
      <ul className="flex items-center justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group inline-flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-colors ${
                  active
                    ? "bg-black/5 text-black dark:bg-white/10 dark:text-white"
                    : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "" : "opacity-80 group-hover:opacity-100"}`} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


