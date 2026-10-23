"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Mail,
  MailCheck,
  Phone,
  Receipt,
  Search,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, paymentStatusSentence } from "@/lib/payment";
import { cn } from "@/lib/utils";
import type { Store, TimelineEntry } from "@/lib/types";

type Kind = "contact" | "register" | "newsletter";

/**
 * A single shape for the detail view. The three submission kinds are stored
 * separately (see lib/store.ts) but share these fields, so we widen rather than
 * intersect them.
 */
type AnySubmission = {
  id: string;
  createdAt: string;
  email: string;
  phone?: string;
  status: string;
  /* contact */
  name?: string;
  organisation?: string;
  category?: string;
  subject?: string;
  message?: string;
  notes?: TimelineEntry[] | string;
  /* registration */
  reference?: string;
  type?: string;
  programme?: string;
  programmeName?: string;
  event?: string;
  eventTitle?: string;
  format?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  school?: string;
  grade?: string;
  schoolLocation?: string;
  state?: string;
  city?: string;
  role?: string;
  participants?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  consent?: boolean;
  consentAt?: string | null;
  thread?: TimelineEntry[];
  /* payment */
  paymentStatus?: string;
  paymentRequired?: boolean;
  fee?: string;
  paymentInstructions?: string;
  registrationNumber?: string | null;
  paymentReason?: string;
  paymentReviewedAt?: string | null;
  confirmedAt?: string | null;
  receipts?: { id: number; kind: string; at: string; fileName: string; mimeType?: string; sizeBytes?: number | null; reason: string }[];
  /* newsletter */
  source?: string;
};

const TYPE_LABEL: Record<string, string> = {
  student: "Student / participant",
  school: "School",
  educator: "Educator",
  professional: "STEM professional",
  partner: "Organisation / partner",
};

const SOURCE_LABEL: Record<string, string> = { newsletter: "Newsletter box", "stem-guide": "STEM Guide “Notify me”" };

const fullNameOf = (i: AnySubmission) => i.fullName || `${i.firstName ?? ""} ${i.lastName ?? ""}`.trim();

const CONTACT_STATUS = ["new", "in-progress", "replied", "closed"] as const;
const REG_STATUS = ["new", "contacted", "confirmed", "waitlist", "declined"] as const;

const STATUS_TONE: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  "in-progress": "bg-sky-100 text-sky-800",
  replied: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-600",
  contacted: "bg-sky-100 text-sky-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  waitlist: "bg-violet-100 text-violet-800",
  declined: "bg-rose-100 text-rose-800",
  subscribed: "bg-emerald-100 text-emerald-800",
  unsubscribed: "bg-slate-200 text-slate-600",
};

function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function SubmissionsPanel({ content, refresh, emailConfigured = false }: { content: Store; refresh: () => Promise<void>; emailConfigured?: boolean }) {
  const [kind, setKind] = useState<Kind>("contact");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** "", "awaiting_receipt", "under_review", "approved", "rejected", "not_required" */
  const [paymentFilter, setPaymentFilter] = useState("");

  const contact = content.submissions.contact;
  const register = content.submissions.register;
  const newsletter = content.submissions.newsletter;

  const counts = {
    contactNew: contact.filter((c) => c.status === "new").length,
    registerNew: register.filter((r) => r.status === "new").length,
    newsletter: newsletter.filter((n) => n.status === "subscribed").length,
    /** receipts an admin still has to approve or reject */
    toReview: register.filter((r) => r.paymentStatus === "under_review").length,
    awaitingReceipt: register.filter((r) => r.paymentStatus === "awaiting_receipt").length,
    approved: register.filter((r) => r.paymentStatus === "approved").length,
    rejected: register.filter((r) => r.paymentStatus === "rejected").length,
  };

  const rows = useMemo(() => {
    const list = kind === "contact" ? contact : kind === "register" ? register : newsletter;
    const q = query.trim().toLowerCase();
    return list.filter((item) => {
      const status = (item as { status: string }).status;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (kind === "register" && paymentFilter) {
        const pay = (item as unknown as AnySubmission).paymentStatus ?? "not_required";
        if (pay !== paymentFilter) return false;
      }
      if (!q) return true;
      return JSON.stringify(item).toLowerCase().includes(q);
    });
  }, [kind, contact, register, newsletter, query, statusFilter, paymentFilter]);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      if (body.status !== undefined || body.note !== undefined) {
        const r = await fetch("/api/admin/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!d.ok) alert(d.error ?? "Could not update this entry");
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entry permanently?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/submissions?type=${kind}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!d.ok) alert(d.error ?? "Could not delete this entry");
      setOpenId(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "contact", label: "Contact messages", count: counts.contactNew },
            { key: "register", label: "Registrations", count: counts.registerNew },
            { key: "newsletter", label: "Newsletter", count: counts.newsletter },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setKind(t.key);
              setOpenId(null);
              setStatusFilter("all");
              setPaymentFilter("");
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition",
              kind === t.key ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-navy-300",
            )}
          >
            {t.label}
            {t.count > 0 ? (
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-extrabold", kind === t.key ? "bg-sun-400 text-navy-950" : "bg-amber-100 text-amber-800")}>
                {t.count} new
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <span className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, school…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-700"
          />
        </span>
        {kind !== "newsletter" ? (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold outline-none focus:border-navy-700"
          >
            <option value="all">All statuses</option>
            {(kind === "contact" ? CONTACT_STATUS : REG_STATUS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : null}
        {kind === "register" ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaymentFilter(paymentFilter === "under_review" ? "" : "under_review")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition",
                paymentFilter === "under_review"
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-navy-400",
              )}
            >
              <Receipt className="size-3.5" /> Payments to review
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                  counts.toReview > 0
                    ? paymentFilter === "under_review"
                      ? "bg-sun-400 text-navy-950"
                      : "bg-rose-100 text-rose-700"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {counts.toReview}
              </span>
            </button>
            {[
              { key: "awaiting_receipt", label: "Awaiting receipt", count: counts.awaitingReceipt },
              { key: "approved", label: "Approved", count: counts.approved },
              { key: "rejected", label: "Rejected", count: counts.rejected },
              { key: "not_required", label: "No payment", count: 0 },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setPaymentFilter(paymentFilter === f.key ? "" : f.key)}
                className={cn(
                  "rounded-lg border px-2.5 py-2 text-[11px] font-bold transition",
                  paymentFilter === f.key
                    ? "border-navy-800 bg-navy-800 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-navy-400",
                )}
              >
                {f.label}
                {f.count > 0 ? <span className="ml-1 text-[10px] opacity-70">{f.count}</span> : null}
              </button>
            ))}
          </div>
        ) : null}
        <a
          href={`/api/admin/export?type=${kind}&format=csv`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <Download className="size-3.5" /> Export CSV
        </a>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : null} Refresh
        </button>
      </div>

      {/* rows */}
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            No entries yet. Submissions from the website appear here instantly.
          </p>
        ) : (
          rows.map((row) => {
            const item = row as unknown as AnySubmission;
            const isOpen = openId === item.id;
            const title =
              kind === "contact"
                ? `${item.name} — ${item.subject}`
                : kind === "register"
                  ? `${fullNameOf(item)}${item.programmeName || item.programme || item.eventTitle || item.event ? ` · ${item.programmeName || item.programme || item.eventTitle || item.event}` : ""}`
                  : item.email;
            const subtitle =
              kind === "contact"
                ? item.email
                : kind === "register"
                  ? `${TYPE_LABEL[item.type ?? ""] ?? item.type} · ${item.email}${item.reference ? ` · ${item.reference}` : ""}${item.registrationNumber ? ` · No. ${item.registrationNumber}` : ""}`
                  : `Subscribed ${when(item.createdAt)}${item.source ? ` · ${SOURCE_LABEL[item.source] ?? item.source}` : ""}`;

            return (
              <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-slate-50 sm:px-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-800">{title}</span>
                    <span className="block truncate text-xs text-slate-500">{subtitle}</span>
                  </span>
                  {kind === "register" && item.paymentStatus && item.paymentStatus !== "not_required" ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase",
                        PAYMENT_STATUS_TONE[item.paymentStatus] ?? "bg-slate-100 text-slate-600",
                      )}
                    >
                      {item.paymentStatus === "under_review" ? "to review" : item.paymentStatus.replace(/_/g, " ")}
                    </span>
                  ) : null}
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase", STATUS_TONE[item.status] ?? "bg-slate-100 text-slate-600")}>
                    {item.status}
                  </span>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:block">{when(item.createdAt)}</span>
                </button>

                {isOpen ? (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                    <Detail
                      item={item}
                      kind={kind}
                      onPatch={patch}
                      onDelete={() => remove(item.id)}
                      emailConfigured={emailConfigured}
                    />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ detail */

function Detail({
  item,
  kind,
  onPatch,
  onDelete,
  emailConfigured,
}: {
  item: AnySubmission;
  kind: Kind;
  onPatch: (body: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
  emailConfigured: boolean;
}) {
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState(
    kind === "contact"
      ? `Re: ${item.subject ?? "your message"}`
      : `Your AFRISTEM registration${item.programmeName || item.eventTitle ? ` — ${item.programmeName || item.eventTitle}` : ""}${item.reference ? ` (${item.reference})` : ""}`,
  );
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<null | { delivered: boolean; dev: boolean }>(null);
  const [sending, setSending] = useState(false);

  const notes: TimelineEntry[] = kind === "contact" && Array.isArray(item.notes) ? item.notes : kind === "register" ? (item.thread ?? []) : [];
  const statuses = kind === "contact" ? CONTACT_STATUS : REG_STATUS;

  const send = async () => {
    setSending(true);
    const r = await fetch("/api/admin/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: kind === "register" ? "register" : "contact", id: item.id, subject, message }),
    });
    const data = (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; delivered?: boolean; dev?: boolean; error?: string };
    setSending(false);
    if (data.ok) {
      setSent({ delivered: Boolean(data.delivered), dev: Boolean(data.dev) });
      setMessage("");
    } else {
      alert(data.error ?? "Could not send the reply");
    }
    // refresh either way: failed attempts are recorded on the entry too
    await onPatch({ type: kind, id: item.id });
  };

  const fields: [string, string | undefined][] =
    kind === "contact"
      ? [
          ["Name", item.name],
          ["Email", item.email],
          ["Phone", item.phone || "—"],
          ["Organisation", item.organisation || "—"],
          ["Category", item.category],
          ["Subject", item.subject ?? "—"],
        ]
      : kind === "register"
        ? ([
            ["Reference", item.reference ?? "—"],
            ["Payment", PAYMENT_STATUS_LABEL[item.paymentStatus ?? "not_required"] ?? "Payment not required"],
            ["Registration number", item.registrationNumber || "—"],
            ...(item.paymentStatus && item.paymentStatus !== "not_required" ? ([["Fee", item.fee || "—"]] as [string, string][]) : []),
            ["Registering as", TYPE_LABEL[item.type ?? ""] ?? item.type ?? "—"],
            ["Programme", item.programmeName || item.programme || "—"],
            ["Event", item.eventTitle || item.event || "—"],
            ["Category", item.category || "—"],
            ["Preferred format", item.format || "—"],
            ["Name", fullNameOf(item)],
            ["Email", item.email],
            ["Phone", item.phone],
            ...(item.type === "student"
              ? ([
                  ["Date of birth", item.dob || "—"],
                  ["Gender", item.gender || "—"],
                  ["Class / grade", item.grade || "—"],
                ] as [string, string][])
              : []),
            ["School", item.school || "—"],
            ["School location", item.schoolLocation || "—"],
            ...(item.state || item.city ? ([["State / City", [item.state, item.city].filter(Boolean).join(", ")]] as [string, string][]) : []),
            ["Role", item.role || "—"],
            ["Organisation", item.organisation || "—"],
            ...(item.participants ? ([["Participants", item.participants]] as [string, string][]) : []),
            ...(item.guardianName || item.guardianPhone
              ? ([
                  ["Parent / guardian", `${item.guardianName ?? ""}${item.guardianRelationship ? ` (${item.guardianRelationship})` : ""}`],
                  ["Guardian phone", item.guardianPhone || "—"],
                  ["Guardian email", item.guardianEmail || "—"],
                ] as [string, string][])
              : []),
            ["Consent", item.consent ? `Given${item.consentAt ? ` · ${when(item.consentAt)}` : ""}` : "—"],
          ] as [string, string | undefined][])
        : [
            ["Email", item.email],
            ["Status", item.status],
            ["Subscribed", when(item.createdAt)],
            ["Form", SOURCE_LABEL[item.source ?? ""] ?? item.source ?? "—"],
          ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-3">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          {fields.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{k}</dt>
              <dd className="truncate font-semibold text-slate-800">{v || "—"}</dd>
            </div>
          ))}
        </dl>

        {kind === "contact" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Message</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.message}</p>
          </div>
        ) : null}

        {kind === "register" && typeof item.notes === "string" && item.notes ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Notes from applicant</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{(item.notes as unknown as string)}</p>
          </div>
        ) : null}

        {kind === "register" ? <PaymentPanel item={item} onDone={() => onPatch({ type: kind, id: item.id })} /> : null}

        {kind !== "newsletter" ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Status</span>
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void onPatch({ type: kind, id: item.id, status: s })}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold transition",
                  item.status === s ? STATUS_TONE[s] : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                )}
              >
                {s}
              </button>
            ))}
            <button type="button" onClick={onDelete} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50">
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
            <button
              type="button"
              onClick={() => void onPatch({ type: "newsletter", id: item.id, status: item.status === "subscribed" ? "unsubscribed" : "subscribed" })}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Mark as {item.status === "subscribed" ? "unsubscribed" : "subscribed"}
            </button>
            <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <Mail className="size-3.5" /> Email
            </a>
            <button type="button" onClick={onDelete} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50">
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* reply + timeline */}
      <div className="space-y-3">
        {kind !== "newsletter" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-800">
              <MailCheck className="size-4 text-navy-700" /> Reply by email
            </p>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-700"
              placeholder="Subject"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-navy-700"
              placeholder={`Write your reply to ${item.email}…`}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!message.trim() || sending}
                onClick={() => void send()}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition",
                  message.trim() && !sending ? "bg-navy-800 hover:bg-navy-900" : "cursor-not-allowed bg-slate-300",
                )}
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send reply
              </button>
              <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <Mail className="size-3.5" /> Open in mail app
              </a>
              {item.phone ? (
                <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  <Phone className="size-3.5" /> Call
                </a>
              ) : null}
            </div>
            {sent ? (
              <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-bold", sent.dev ? "text-amber-600" : "text-emerald-600")}>
                {sent.dev ? <Star className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                {sent.dev
                  ? "Not delivered — email is not configured yet (add RESEND_API_KEY in Vercel). Use “Open in mail app” instead."
                  : "Reply delivered by email"}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-slate-400">
              {emailConfigured
                ? "Replies are recorded on the entry so anyone on the team can see what was sent."
                : "Email delivery is not configured yet, so replies cannot be sent from here — use “Open in mail app”."}
            </p>
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-extrabold text-slate-800">Internal notes</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-700"
            placeholder="e.g. called, awaiting documents…"
          />
          <button
            type="button"
            disabled={!note.trim()}
            onClick={async () => {
              await onPatch({ type: kind, id: item.id, note });
              setNote("");
            }}
            className={cn(
              "mt-2 rounded-lg px-3 py-2 text-xs font-bold text-white transition",
              note.trim() ? "bg-slate-700 hover:bg-slate-800" : "cursor-not-allowed bg-slate-300",
            )}
          >
            Add note
          </button>

          {notes && notes.length > 0 ? (
            <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {[...notes].reverse().map((n, i) => (
                <li
                  key={`${n.at}-${i}`}
                  className={cn(
                    "rounded-lg p-2.5",
                    n.kind === "reply" && n.emailStatus === "failed" ? "bg-rose-50" : n.kind === "reply" && n.emailStatus === "sent" ? "bg-emerald-50" : n.kind === "reply" ? "bg-amber-50" : "bg-slate-50",
                  )}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{when(n.at)}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{n.text}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * The payment half of a registration: what the person owes, every receipt they
 * sent, and the two decisions an admin can take.
 *
 * Approving requires the person's registration number (unique across all
 * registrations); rejecting requires a reason, which the person sees word for
 * word. Free registrations get "Confirm registration" instead.
 */
function PaymentPanel({ item, onDone }: { item: AnySubmission; onDone: () => Promise<void> }) {
  const status = item.paymentStatus ?? "not_required";
  const receipts = item.receipts ?? [];
  const [number, setNumber] = useState(item.registrationNumber ?? "");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [working, setWorking] = useState<"" | "approve" | "reject" | "confirm">("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const act = async (action: "approve" | "reject" | "confirm") => {
    setWorking(action);
    setError("");
    setMessage("");
    try {
      const r = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, action, registrationNumber: number, reason, note }),
      });
      const data = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !data.ok) throw new Error(data.error || "The decision could not be saved.");
      setMessage(
        action === "reject"
          ? "Receipt rejected. The person can now upload a new one."
          : action === "approve"
            ? "Payment approved and registration number saved."
            : "Registration confirmed and registration number saved.",
      );
      setReason("");
      await onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setWorking("");
    }
  };

  const fileSize = (bytes?: number | null) =>
    bytes ? `${(bytes / 1024 / 1024).toFixed(bytes > 1024 * 1024 ? 2 : 2)} MB` : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
          <Receipt className="size-4 text-navy-700" /> Payment proof
        </p>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase", PAYMENT_STATUS_TONE[status] ?? "bg-slate-100 text-slate-600")}>
          {PAYMENT_STATUS_LABEL[status] ?? "Payment not required"}
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        {paymentStatusSentence({
          paymentStatus: status,
          paymentRequired: item.paymentRequired,
          rejectionReason: item.paymentReason,
          registrationNumber: item.registrationNumber,
        })}
      </p>

      {status !== "not_required" ? (
        <div className="mt-3 grid gap-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          <p><span className="font-bold">Fee:</span> {item.fee || "—"}</p>
          <p><span className="font-bold">Pay to:</span> {item.paymentInstructions || "—"}</p>
          {item.registrationNumber ? <p><span className="font-bold">Registration number:</span> {item.registrationNumber}</p> : null}
        </div>
      ) : null}

      {receipts.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {receipts.map((r) => (
            <li key={`${r.id}-${r.at}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800">
                {r.kind === "receipt" ? "Receipt" : r.kind === "approved" ? "Approved" : r.kind === "rejected" ? "Rejected" : "Confirmed"}
              </span>
              <span>{when(r.at)}</span>
              {r.fileName ? <span className="truncate">· {r.fileName}{r.sizeBytes ? ` (${fileSize(r.sizeBytes)})` : ""}</span> : null}
              {r.kind === "receipt" ? (
                <a
                  href={`/api/admin/receipt?id=${r.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-navy-700 underline underline-offset-2 hover:text-navy-900"
                >
                  <FileText className="size-3" /> Open receipt
                </a>
              ) : null}
              {r.reason ? <span className="w-full text-rose-700">Reason: {r.reason}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[11px] text-slate-400">
          {status === "awaiting_receipt" ? "No receipt uploaded yet." : "No payment history yet."}
        </p>
      )}

      {status === "under_review" ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400" htmlFor={`approve-${item.id}`}>
              Approve — registration number *
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id={`approve-${item.id}`}
                value={number}
                onChange={(e) => setNumber(e.target.value.toUpperCase())}
                placeholder="e.g. AOCT-2026-001"
                className="min-w-[10rem] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-700"
              />
              <button
                type="button"
                disabled={!number.trim() || working !== ""}
                onClick={() => void act("approve")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition",
                  number.trim() && !working ? "bg-emerald-600 hover:bg-emerald-700" : "cursor-not-allowed bg-slate-300",
                )}
              >
                {working === "approve" ? <Loader2 className="size-3.5 animate-spin" /> : <BadgeCheck className="size-3.5" />} Approve
              </button>
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (stored with the decision)"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-navy-700"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Required and unique across all registrations. It is shown to the person and printed on their slip.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400" htmlFor={`reject-${item.id}`}>
              Reject — reason *
            </label>
            <textarea
              id={`reject-${item.id}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. The amount does not match the fee — please send the receipt for ₦7,000."
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-700"
            />
            <button
              type="button"
              disabled={!reason.trim() || working !== ""}
              onClick={() => void act("reject")}
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition",
                reason.trim() && !working ? "bg-rose-600 hover:bg-rose-700" : "cursor-not-allowed bg-slate-300",
              )}
            >
              {working === "reject" ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />} Reject receipt
            </button>
            <p className="mt-1 text-[11px] text-slate-400">The person sees this reason and can upload a new receipt.</p>
          </div>
        </div>
      ) : null}

      {status === "not_required" ? (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400" htmlFor={`confirm-${item.id}`}>
            Confirm registration — registration number *
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id={`confirm-${item.id}`}
              value={number}
              onChange={(e) => setNumber(e.target.value.toUpperCase())}
              placeholder="e.g. SKC-2026-014"
              className="min-w-[10rem] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-700"
            />
            <button
              type="button"
              disabled={!number.trim() || working !== ""}
              onClick={() => void act("confirm")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white transition",
                number.trim() && !working ? "bg-navy-800 hover:bg-navy-900" : "cursor-not-allowed bg-slate-300",
              )}
            >
              {working === "confirm" ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />} Confirm registration
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Requires the person&apos;s registration number (unique across all registrations).
          </p>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p> : null}
      {message ? <p className="mt-3 text-xs font-semibold text-emerald-600">{message}</p> : null}
    </div>
  );
}

export { X };
