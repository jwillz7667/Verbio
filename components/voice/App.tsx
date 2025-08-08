"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the bundled App to avoid TS path/type issues
const VoiceApp = dynamic(() => import("../../app/Voice Translation App/App"), {
  ssr: false,
});

export default function AppWrapper() {
  return <VoiceApp />;
}


