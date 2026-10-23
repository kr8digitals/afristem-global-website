"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * The receipt box. Used on the confirmation screen straight after registering
 * and again on /register/status when a receipt is waiting or was rejected.
 *
 * The browser checks the size and extension as a courtesy; the server reads the
 * file's first bytes and is the only check that counts.
 */
export function ReceiptUpload({
  reference,
  email,
  onUploaded,
  tone = "light",
}: {
  reference: string;
  email: string;
  onUploaded?: (paymentStatus: string) => void;
  tone?: "light" | "dark";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const pick = (f: File | null) => {
    setError("");
    setDone(false);
    if (!f) return setFile(null);
    if (f.size > MAX_BYTES) {
      setError("That file is larger than 10 MB. Take a smaller photo or compress the PDF.");
      return setFile(null);
    }
    if (!/\.(jpe?g|png|webp|pdf)$/i.test(f.name)) {
      setError("Upload a JPG, PNG or WebP photo, or a PDF.");
      return setFile(null);
    }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("reference", reference);
      body.append("email", email);
      body.append("file", file);
      const r = await fetch("/api/register/receipt", { method: "POST", body });
      const data = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; paymentStatus?: string; message?: string };
      if (!r.ok || !data.ok) throw new Error(data.error || "The receipt could not be uploaded. Please try again.");
      setDone(true);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.(data.paymentStatus ?? "under_review");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5">
        <p className="flex items-center gap-2 text-sm font-extrabold text-emerald-800">
          <CheckCircle2 className="size-5" /> Receipt received — your payment is now under review
        </p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
          Our team will check it and confirm your registration. You can upload another receipt here if you need to.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-3 text-xs font-bold text-emerald-800 underline underline-offset-4 hover:text-emerald-900"
        >
          Upload a different receipt
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        tone === "dark" ? "border-white/20 bg-white/5" : "border-navy-900/10 bg-white",
      )}
    >
      <p className={cn("flex items-center gap-2 text-sm font-extrabold", tone === "dark" ? "text-white" : "text-navy-900")}>
        <UploadCloud className="size-4" /> Upload your payment receipt
      </p>
      <p className={cn("mt-1 text-xs leading-relaxed", tone === "dark" ? "text-white/60" : "text-navy-800/60")}>
        JPG, PNG, WebP or PDF — up to 10 MB. A clear photo of the bank transfer or teller is fine.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
          className="sr-only"
          id={`receipt-${reference}`}
        />
        <label
          htmlFor={`receipt-${reference}`}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-navy-800/15 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 transition hover:border-navy-800"
        >
          <FileText className="size-4" /> {file ? "Choose another file" : "Choose a file"}
        </label>
        {file ? (
          <span className={cn("min-w-0 truncate text-xs font-semibold", tone === "dark" ? "text-white/80" : "text-navy-800/80")}>
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => void upload()}
          disabled={!file || busy}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white transition",
            file && !busy ? "bg-navy-800 hover:bg-navy-900" : "cursor-not-allowed bg-slate-300",
          )}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          {busy ? "Uploading…" : "Send receipt"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-rose-600">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {error}
        </p>
      ) : null}
    </div>
  );
}
