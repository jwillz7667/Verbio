"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

export function PageTransitions({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const MotionShell = dynamic(() => import("./PageTransitionsShell"), { ssr: false }) as any;
  return <MotionShell pathname={pathname}>{children}</MotionShell>;
}


