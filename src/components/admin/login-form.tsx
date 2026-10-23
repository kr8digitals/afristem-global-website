"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, Lock } from "lucide-react";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = (await r.json()) as { ok?: boolean; error?: string };
      if (d.ok) {
        router.replace(next.startsWith("/admin") ? next : "/admin");
        router.refresh();
      } else {
        setError(d.error ?? "Incorrect password");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-sun-400 text-lg font-extrabold text-navy-950 shadow-lg">AF</span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-white">AFRISTEM Admin</h1>
          <p className="mt-1 text-sm text-white/60">Sign in to manage the website</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-2xl">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-500">
              <Lock className="size-3.5" /> Password
            </span>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the admin password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            />
          </label>

          {error ? (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!password || busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-navy-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            <Link href="/" className="font-semibold text-navy-700 hover:underline">
              ← Back to website
            </Link>
          </p>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-white/40">
          Protected area. Sessions last 12 hours. Forgot the password? Delete the row in the{" "}
          <code className="font-mono">admin_account</code> table (Supabase → Table editor), then sign in with{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> and choose a new one.
        </p>
      </div>
    </div>
  );
}
