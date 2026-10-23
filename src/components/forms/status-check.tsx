"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Printer, Search, ShieldCheck } from "lucide-react";
import { ReceiptUpload } from "@/components/forms/receipt-upload";
import { canUploadReceipt, paymentStatusLabel, paymentStatusSentence } from "@/lib/payment";
import type { PaymentStatus, RegistrationLookup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { registrationTypeLabel, registrationWhatsAppMessage, whatsappLink } from "@/lib/whatsapp";

type LookupResult = RegistrationLookup & {
  whatsapp?: string;
  orgName?: string;
  orgEmail?: string;
  orgPhone?: string;
  message?: string;
  error?: string;
};

const TONE: Record<string, string> = {
  not_required: "bg-slate-100 text-slate-700",
  awaiting_receipt: "bg-amber-100 text-amber-900",
  under_review: "bg-sky-100 text-sky-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-rose-100 text-rose-900",
};

const inputCls =
  "w-full rounded-2xl border border-navy-900/10 bg-white px-4 py-3.5 text-navy-900 placeholder:text-navy-800/40 transition-all focus:border-navy-500 focus:outline-none focus:ring-4 focus:ring-navy-500/10";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-800/70";

/** "Check my registration": reference + email, then the real status. */
export function StatusCheck() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const q = new URLSearchParams({ reference: reference.trim(), email: email.trim() });
      const r = await fetch(`/api/register/status?${q}`, { cache: "no-store" });
      const data = (await r.json().catch(() => ({}))) as LookupResult;
      if (data.error && !data.found) throw new Error(data.error);
      setResult(data);
      setPaymentStatus(data.paymentStatus);
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const found = Boolean(result?.found);
  const status = paymentStatus ?? result?.paymentStatus;
  const number = result?.registrationNumber ?? null;
  const confirmed = status === "approved" || Boolean(result?.status === "confirmed" && number);
  const uploadable = canUploadReceipt(status);
  const registeredFor = result?.registeredFor || result?.programmeName || result?.eventTitle || "";

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="card p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="s-ref">Registration reference *</label>
            <input
              id="s-ref"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              className={inputCls}
              placeholder="AFR-2026-1F4C9"
              autoComplete="off"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="s-email">Email address *</label>
            <input
              id="s-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="the email you registered with"
              autoComplete="email"
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className="btn-navy">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Check my registration
          </button>
          <p className="flex items-center gap-1.5 text-xs text-navy-800/60">
            <ShieldCheck className="size-3.5" /> Both must match the registration.
          </p>
        </div>
        {error ? (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-rose-600">
            <AlertCircle className="size-4" /> {error}
          </p>
        ) : null}
      </form>

      {result && !found ? (
        <div className="card border-amber-200 p-6 sm:p-8">
          <p className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <AlertCircle className="size-5 text-amber-500" /> Nothing matched
          </p>
          <p className="mt-2 text-sm leading-relaxed text-navy-800/75">
            {result.message ??
              "We could not find a registration with that reference and email address. Check both and try again — the reference looks like AFR-2026-1F4C9."}
          </p>
          <p className="mt-3 text-sm text-navy-800/60">
            Lost your reference?{" "}
            <Link className="font-bold text-navy-900 underline underline-offset-4" href="/contact">
              Contact us
            </Link>{" "}
            with your name, phone number and what you registered for.
          </p>
        </div>
      ) : null}

      {found && result ? (
        <div className="space-y-5">
          <div className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-navy-800/50">Registration</p>
                <p className="font-display text-2xl font-extrabold tracking-wider text-navy-900">{result.reference}</p>
                <p className="mt-1 text-sm font-semibold text-navy-800">{result.fullName}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide", TONE[status ?? "not_required"])}>
                {paymentStatusLabel(status)}
              </span>
            </div>

            <div className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl border border-navy-900/10 bg-navy-50/60 p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-navy-800/50">Registering as</dt>
                <dd className="font-semibold text-navy-900">{registrationTypeLabel(result.type)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-navy-800/50">Programme / event</dt>
                <dd className="font-semibold text-navy-900">{registeredFor || "—"}</dd>
              </div>
              {result.school ? (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-navy-800/50">School</dt>
                  <dd className="font-semibold text-navy-900">{result.school}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-navy-800/50">Registration number</dt>
                <dd className="font-semibold text-navy-900">{number || "—"}</dd>
              </div>
            </div>

            <p
              className={cn(
                "mt-5 rounded-2xl border p-4 text-sm leading-relaxed",
                status === "rejected"
                  ? "border-rose-200 bg-rose-50 text-rose-900"
                  : status === "approved"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : status === "under_review"
                      ? "border-sky-200 bg-sky-50 text-sky-900"
                      : "border-navy-900/10 bg-white text-navy-800/80",
              )}
            >
              <strong className="font-extrabold">Status: </strong>
              {paymentStatusSentence({
                paymentStatus: status,
                paymentRequired: result.paymentRequired,
                rejectionReason: result.rejectionReason,
                registrationNumber: number,
                status: result.status,
              })}
            </p>

            {status !== "not_required" && result.fee ? (
              <p className="mt-4 text-sm text-navy-800/75">
                <strong className="font-bold text-navy-900">Fee:</strong> {result.fee}
                {result.paymentInstructions ? (
                  <>
                    {" · "}
                    <strong className="font-bold text-navy-900">How to pay:</strong> {result.paymentInstructions}
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          {uploadable ? (
            <div className="no-print space-y-4">
              <ReceiptUpload
                reference={result.reference ?? ""}
                email={result.email ?? email}
                onUploaded={(next) => setPaymentStatus(next === "under_review" ? "under_review" : status)}
              />
              {result.whatsapp ? (
                <a
                  href={whatsappLink(
                    result.whatsapp,
                    registrationWhatsAppMessage({
                      reference: result.reference ?? "",
                      fullName: result.fullName ?? "",
                      phone: result.phone ?? "",
                      type: result.type,
                      registeredFor,
                      school: result.school,
                      payment: true,
                    }),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MessageCircle className="size-4" /> Send payment proof on WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}

          {confirmed && number ? (
            <div className="space-y-3">
              <Slip result={result} registrationNumber={number} registeredFor={registeredFor} />
              <div className="no-print flex flex-wrap gap-3">
                <button type="button" onClick={() => window.print()} className="btn-navy">
                  <Printer className="size-4" /> Print confirmation slip
                </button>
                {result.whatsapp ? (
                  <a
                    href={whatsappLink(
                      result.whatsapp,
                      registrationWhatsAppMessage({
                        reference: result.reference ?? "",
                        fullName: result.fullName ?? "",
                        phone: result.phone ?? "",
                        type: result.type,
                        registeredFor,
                        school: result.school,
                        payment: false,
                      }),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    <MessageCircle className="size-4" /> Message us on WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {result.receipts && result.receipts.length > 0 ? (
            <div className="no-print card p-6">
              <p className="text-sm font-extrabold text-navy-900">Payment &amp; receipt history</p>
              <ul className="mt-3 space-y-2">
                {result.receipts.map((r) => (
                  <li key={`${r.id}-${r.at}`} className="flex flex-wrap items-baseline gap-x-2 border-b border-navy-900/5 pb-2 text-xs text-navy-800/75 last:border-0">
                    <span className="font-bold text-navy-900">
                      {r.kind === "receipt" ? "Receipt uploaded" : r.kind === "approved" ? "Approved" : r.kind === "rejected" ? "Rejected" : "Confirmed"}
                    </span>
                    <span>{new Date(r.at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    {r.fileName ? <span>· {r.fileName}</span> : null}
                    {r.reason ? <span className="w-full text-rose-700">Reason: {r.reason}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** The printable confirmation slip — this is how a confirmed person "proceeds". */
function Slip({
  result,
  registrationNumber,
  registeredFor,
}: {
  result: LookupResult;
  registrationNumber: string;
  registeredFor: string;
}) {
  const when = result.confirmedAt || result.createdAt;
  return (
    <div className="print-slip card border-emerald-300 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 border-b border-navy-900/10 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-800/50">{result.orgName || "AFRISTEM"} · confirmation slip</p>
          <p className="mt-1 font-display text-xl font-extrabold text-navy-900">Registration confirmed</p>
        </div>
        <CheckCircle2 className="size-8 shrink-0 text-emerald-600" />
      </div>
      <dl className="mt-5 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
        {[
          ["Name", result.fullName ?? ""],
          ["Reference", result.reference ?? ""],
          ["Registration number", registrationNumber],
          ["Programme / event", registeredFor || "—"],
          ["Registering as", registrationTypeLabel(result.type)],
          ["Confirmed on", when ? new Date(when).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-navy-800/50">{k}</dt>
            <dd className={cn("font-semibold text-navy-900", k === "Registration number" && "font-display text-lg tracking-wider")}>{v || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 border-t border-navy-900/10 pt-4 text-xs leading-relaxed text-navy-800/60">
        Keep this slip — bring it (printed or on your phone) on the day. Quote your registration number in every message
        to {result.orgName || "AFRISTEM"}
        {result.orgEmail ? ` · ${result.orgEmail}` : ""}
        {result.orgPhone ? ` · ${result.orgPhone}` : ""}.
      </p>
    </div>
  );
}
