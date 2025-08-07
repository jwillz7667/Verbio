"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const signInWithMagicLink = async () => {
    if (!email) return;
    try {
      setLoading(true);
      const { error } = await getSupabaseBrowser().auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
        },
      });
      if (error) throw error;
      toast.success("Check your email for the sign-in link.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: "github" | "google") => {
    try {
      setLoading(true);
      const { error } = await getSupabaseBrowser().auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/profile` },
      });
      if (error) throw error;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "OAuth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6">
        <h1 className="mb-6 text-center text-2xl font-semibold">Sign in</h1>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-white/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none backdrop-blur focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            disabled={!email || loading}
            onClick={signInWithMagicLink}
            className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
          <div className="my-2 text-center text-xs text-white/50">or</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => signInWithProvider("github")}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Continue with GitHub
            </button>
            <button
              onClick={() => signInWithProvider("google")}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


