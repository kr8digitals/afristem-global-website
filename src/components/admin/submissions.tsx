"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, Loader2, Mail, MailCheck, Phone, Search, Send, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactSubmission, NewsletterSubmission, RegistrationSubmission, Store } from "@/lib/store";

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
  category?: string;
  subject?: string;
  message?: string;
  notes?: { at: string; text: string; by: string }[];
  /* registration */
  reference?: string;
  type?: string;
  programme?: string;
  event?: string;
  eventTitle?: string;
  registrationDetails?: Record<string, string>;
  firstName?: string;
  lastName?: string;
  school?: string;
  state?: string;
  city?: string;
  role?: string;
  participants?: string;
  thread?: { at: string; text: string; by: string }[];
};

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

export function SubmissionsPanel({ content, refresh }: { content: Store; refresh: () => Promise<void> }) {
  const [kind, setKind] = useState<Kind>("contact");
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const contact = content.submissions.contact;
  const register = content.submissions.register;
  const newsletter = content.submissions.newsletter;

  const counts = {
    contactNew: contact.filter((c) => c.status === "new").length,
    registerNew: register.filter((r) => r.status === "new").length,
    newsletter: newsletter.filter((n) => n.status === "subscribed").length,
  };

  const rows = useMemo(() => {
    const list = kind === "contact" ? contact : kind === "register" ? register : newsletter;
    const q = query.trim().toLowerCase();
    return list.filter((item) => {
      const status = (item as { status: string }).status;
      if (kind === "register" && eventFilter !== "all" && (item as RegistrationSubmission).event !== eventFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return JSON.stringify(item).toLowerCase().includes(q);
    });
  }, [kind, contact, register, newsletter, query, statusFilter, eventFilter]);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await refresh();
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entry permanently?")) return;
    setBusy(true);
    await fetch(`/api/admin/submissions?type=${kind}&id=${id}`, { method: "DELETE" });
    setOpenId(null);
    await refresh();
    setBusy(false);
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
        {kind === "register" && <select aria-label="Filter registrations by event" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="max-w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="all">All events</option>{Array.from(new Map([...content.events.map((e) => [e.slug, e.title]), ...register.filter((r) => r.event).map((r) => [r.event!, r.eventTitle || r.event!])] as [string, string][])).map(([slug, title]) => <option key={slug} value={slug}>{title}</option>)}</select>}
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
        <a
          href={`/api/admin/export?type=${kind}&format=csv${kind === "register" && eventFilter !== "all" ? `&event=${encodeURIComponent(eventFilter)}` : ""}`}
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
                  ? `${item.firstName} ${item.lastName}${item.programme ? ` · ${item.programme}` : ""}`
                  : item.email;
            const subtitle =
              kind === "contact"
                ? item.email
                : kind === "register"
                  ? `${item.type} · ${item.email}`
                  : `Subscribed ${when(item.createdAt)}`;

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
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase", STATUS_TONE[item.status] ?? "bg-slate-100 text-slate-600")}>
                    {item.status}
                  </span>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:block">{when(item.createdAt)}</span>
                </button>

                {isOpen ? (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                    <Detail item={item} kind={kind} onPatch={patch} onDelete={() => remove(item.id)} busy={busy} />
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
  busy,
}: {
  item: AnySubmission;
  kind: Kind;
  onPatch: (body: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
  busy: boolean;
}) {
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState(
    kind === "contact"
      ? `Re: ${item.subject ?? "your message"}`
      : `Your AFRISTEM registration${item.programme ? ` — ${item.programme}` : ""}`,
  );
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<null | { delivered: boolean; dev: boolean }>(null);
  const [sending, setSending] = useState(false);

  const notes = kind === "contact" ? item.notes : kind === "register" ? item.thread : [];
  const statuses = kind === "contact" ? CONTACT_STATUS : REG_STATUS;

  const send = async () => {
    setSending(true);
    const r = await fetch("/api/admin/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: kind === "register" ? "register" : "contact", id: item.id, subject, message }),
    });
    const data = (await r.json()) as { ok: boolean; delivered?: boolean; dev?: boolean; error?: string };
    setSending(false);
    if (data.ok) {
      setSent({ delivered: Boolean(data.delivered), dev: Boolean(data.dev) });
      setMessage("");
      await onPatch({ type: kind, id: item.id });
    } else {
      alert(data.error ?? "Could not send the reply");
    }
  };

  const fields: [string, string | undefined][] =
    kind === "contact"
      ? [
          ["Name", item.name],
          ["Email", item.email],
          ["Phone", item.phone || "—"],
          ["Category", item.category],
          ["Subject", item.subject ?? "—"],
        ]
      : kind === "register"
        ? [
            ["Reference", item.reference ?? "—"],
            ["Type", item.type ?? "—"],
            ["Programme", item.programme || "—"],
            ["Name", `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim()],
            ["Email", item.email],
            ["Phone", item.phone],
            ["School", item.school || "—"],
            ["State / City", [item.state, item.city].filter(Boolean).join(", ") || "—"],
            ["Role", item.role || "—"],
            ["Participants", item.participants || "—"],
            ["Event", item.eventTitle || item.event || "—"],
          ]
        : [
            ["Email", item.email],
            ["Status", item.status],
            ["Subscribed", when(item.createdAt)],
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

        {kind === "register" && item.registrationDetails && <div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="mb-3 font-bold">Event registration details</h3><dl className="space-y-3">{Object.entries(item.registrationDetails).filter(([,v]) => v).map(([key, value]) => <div key={key}><dt className="text-xs font-bold uppercase text-slate-500">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="whitespace-pre-wrap text-sm">{value}</dd></div>)}</dl></div>}
        {kind === "register" && item.notes ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Notes from applicant</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{(item.notes as unknown as string)}</p>
          </div>
        ) : null}

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
                  ? "Logged (no RESEND_API_KEY set — add one in Hostinger to deliver for real)"
                  : "Reply delivered by email"}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-slate-400">
              Replies are recorded on the entry so anyone on the team can see what was sent.
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
                <li key={`${n.at}-${i}`} className="rounded-lg bg-slate-50 p-2.5">
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

export { X };
