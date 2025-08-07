import { supabaseServer } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <Image
            src={user.user_metadata?.avatar_url || "/vercel.svg"}
            alt={user.email ?? "User"}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h1 className="text-xl font-semibold">{user.user_metadata?.name || user.email}</h1>
            <p className="text-sm text-white/60">{user.email}</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <form action="/signout" method="post">
            <button
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              type="submit"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Back to app
          </Link>
        </div>
      </div>
    </main>
  );
}


