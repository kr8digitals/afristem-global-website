"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  Inbox,
  KeyRound,
  Layers,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Newspaper,
  Images,
  HelpCircle,
  Handshake,
  Settings,
  Sparkles,
  Users,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/lib/store";
import {
  AnnouncementSection,
  EventsSection,
  FaqsSection,
  GallerySection,
  HeroSection,
  NewsSection,
  PartnersSection,
  ProgrammesSection,
  SiteSection,
  StatsSection,
  TestimonialsSection,
  VideosSection,
  type SectionKey,
} from "@/components/admin/content-sections";
import { SubmissionsPanel } from "@/components/admin/submissions";

type Tab = "overview" | "submissions" | "settings" | SectionKey;

const NAV: { group: string; items: { key: Tab; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    group: "Dashboard",
    items: [
      { key: "overview", label: "Overview", icon: LayoutDashboard },
      { key: "submissions", label: "Submissions", icon: Inbox },
    ],
  },
  {
    group: "Site content",
    items: [
      { key: "announcement", label: "Announcement", icon: Megaphone },
      { key: "hero", label: "Homepage hero", icon: Sparkles },
      { key: "site", label: "Brand & contact", icon: Settings },
      { key: "stats", label: "Statistics", icon: BarChart3 },
      { key: "programmes", label: "Programmes", icon: Layers },
      { key: "events", label: "Events", icon: CalendarDays },
      { key: "news", label: "News", icon: Newspaper },
      { key: "gallery", label: "Gallery", icon: Images },
      { key: "videos", label: "Videos", icon: Video },
      { key: "faqs", label: "FAQs", icon: HelpCircle },
      { key: "testimonials", label: "Testimonials", icon: Users },
      { key: "partners", label: "Partners", icon: Handshake },
    ],
  },
  {
    group: "Account",
    items: [{ key: "settings", label: "Settings", icon: KeyRound }],
  },
];

export function AdminApp({ initialContent }: { initialContent: Store }) {
  const router = useRouter();

  const signOut = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };
  const [content, setContent] = useState<Store>(initialContent);
  const [tab, setTab] = useState<Tab>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/content", { cache: "no-store" });
      const d = (await r.json()) as { content?: Store };
      if (d.content) setContent(d.content);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(
    async (section: SectionKey, value: unknown) => {
      const r = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, value }),
      });
      const d = (await r.json()) as { ok?: boolean; error?: string };
      if (!d.ok) {
        throw new Error(d.error ?? "Could not save");
      }
      setContent((c) => ({ ...c, [section]: value }) as Store);
    },
    [],
  );

  const reset = useCallback(async (section: SectionKey) => {
    const r = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section }),
    });
    const d = (await r.json()) as { ok?: boolean; value?: unknown };
    if (d.ok) setContent((c) => ({ ...c, [section]: d.value }) as Store);
    return d.value;
  }, []);

  const sectionProps = { content, save, reset };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-navy-900/10 bg-navy-950 px-4 py-3 text-white">
        <button type="button" onClick={() => setNavOpen((v) => !v)} className="rounded-lg p-2 hover:bg-white/10 lg:hidden">
          {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-sun-400 text-sm font-extrabold text-navy-950">AF</span>
          <span className="hidden font-display text-sm font-extrabold tracking-tight sm:block">AFRISTEM Admin</span>
        </Link>
        {loading ? <Loader2 className="size-4 animate-spin text-sun-300" /> : null}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold transition hover:bg-white/10"
          >
            <ExternalLink className="size-3.5" /> View site
          </Link>
          <form action="/api/admin/logout" method="post" onSubmit={signOut}>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold transition hover:bg-white/20">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-0 lg:gap-6 lg:px-6">
        {/* sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto border-r border-slate-200 bg-white pt-16 transition-transform lg:sticky lg:top-[57px] lg:z-0 lg:h-[calc(100vh-57px)] lg:translate-x-0 lg:border-r-0 lg:bg-transparent lg:pt-6",
            navOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          )}
        >
          <nav className="space-y-5 px-3 pb-10">
            {NAV.map((group) => (
              <div key={group.group}>
                <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{group.group}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = tab === item.key;
                    const badge =
                      item.key === "submissions"
                        ? content.submissions.contact.filter((c) => c.status === "new").length +
                          content.submissions.register.filter((r) => r.status === "new").length
                        : 0;
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => {
                            setTab(item.key);
                            setNavOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition",
                            active ? "bg-navy-800 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-navy-900",
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {badge > 0 ? (
                            <span className="rounded-full bg-sun-400 px-1.5 py-0.5 text-[10px] font-extrabold text-navy-950">{badge}</span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {navOpen ? <button type="button" aria-label="Close menu" className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden" onClick={() => setNavOpen(false)} /> : null}

        {/* content */}
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7">
          {tab === "overview" ? <Overview content={content} onNavigate={setTab} /> : null}
          {tab === "submissions" ? <SubmissionsPanel content={content} refresh={refresh} /> : null}
          {tab === "settings" ? <SettingsPanel content={content} refresh={refresh} /> : null}
          {tab === "announcement" ? <AnnouncementSection {...sectionProps} /> : null}
          {tab === "hero" ? <HeroSection {...sectionProps} /> : null}
          {tab === "site" ? <SiteSection {...sectionProps} /> : null}
          {tab === "stats" ? <StatsSection {...sectionProps} /> : null}
          {tab === "programmes" ? <ProgrammesSection {...sectionProps} /> : null}
          {tab === "events" ? <EventsSection {...sectionProps} /> : null}
          {tab === "news" ? <NewsSection {...sectionProps} /> : null}
          {tab === "gallery" ? <GallerySection {...sectionProps} /> : null}
          {tab === "videos" ? <VideosSection {...sectionProps} /> : null}
          {tab === "faqs" ? <FaqsSection {...sectionProps} /> : null}
          {tab === "testimonials" ? <TestimonialsSection {...sectionProps} /> : null}
          {tab === "partners" ? <PartnersSection {...sectionProps} /> : null}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ overview */

function Overview({ content, onNavigate }: { content: Store; onNavigate: (t: Tab) => void }) {
  const contact = content.submissions.contact;
  const register = content.submissions.register;
  const newsletter = content.submissions.newsletter;
  const [nowMs] = useState(() => Date.now());
  const upcoming = [...content.events]
    .filter((e) => e.start && new Date(e.start).getTime() > nowMs - 86_400_000)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 4);

  const cards = [
    { label: "New messages", value: contact.filter((c) => c.status === "new").length, total: contact.length, tab: "submissions" as Tab, icon: Inbox, tone: "bg-amber-50 text-amber-700" },
    { label: "New registrations", value: register.filter((r) => r.status === "new").length, total: register.length, tab: "submissions" as Tab, icon: Users, tone: "bg-sky-50 text-sky-700" },
    { label: "Newsletter subscribers", value: newsletter.filter((n) => n.status === "subscribed").length, total: newsletter.length, tab: "submissions" as Tab, icon: Megaphone, tone: "bg-violet-50 text-violet-700" },
    { label: "Upcoming events", value: upcoming.length, total: content.events.length, tab: "events" as Tab, icon: CalendarDays, tone: "bg-emerald-50 text-emerald-700" },
  ];

  const recent = [
    ...contact.slice(0, 4).map((c) => ({ id: c.id, at: c.createdAt, title: `${c.name} — ${c.subject}`, meta: "Contact message", status: c.status })),
    ...register.slice(0, 4).map((r) => ({ id: r.id, at: r.createdAt, title: `${r.firstName} ${r.lastName}`, meta: r.programme || r.type, status: r.status })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 7);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everything on the website — announcements, events, programmes, photos, videos and every form submission — is managed from here.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => onNavigate(c.tab)}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={cn("mb-3 inline-flex size-9 items-center justify-center rounded-xl", c.tone)}>
                <Icon className="size-4" />
              </span>
              <p className="font-display text-3xl font-extrabold leading-none text-navy-900">{c.value}</p>
              <p className="mt-1.5 text-sm font-bold text-slate-700">{c.label}</p>
              <p className="text-xs text-slate-400">{c.total} total</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold text-navy-900">Recent submissions</h2>
            <button type="button" onClick={() => onNavigate("submissions")} className="text-xs font-bold text-navy-700 hover:underline">
              Open inbox →
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              No submissions yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-800">{r.title}</span>
                    <span className="block truncate text-xs text-slate-400">
                      {r.meta} · {new Date(r.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-600">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold text-navy-900">What&apos;s coming up</h2>
            <button type="button" onClick={() => onNavigate("events")} className="text-xs font-bold text-navy-700 hover:underline">
              Manage events →
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              No upcoming events. Add one so the homepage countdown has something to show.
            </p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((e) => (
                <li key={e.slug} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-800">{e.title}</p>
                  <p className="text-xs text-slate-500">
                    {e.displayDate} · {e.location}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-navy-900/10 bg-gradient-to-br from-navy-900 to-navy-800 p-5 text-white shadow-sm">
        <h2 className="font-display text-base font-extrabold">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              { label: "Post an announcement", tab: "announcement" as Tab },
              { label: "Add an event", tab: "events" as Tab },
              { label: "Upload photos", tab: "gallery" as Tab },
              { label: "Publish news", tab: "news" as Tab },
              { label: "Update contact details", tab: "site" as Tab },
            ] as const
          ).map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => onNavigate(a.tab)}
              className="rounded-lg bg-white/10 px-3.5 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/20"
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ settings */

function SettingsPanel({ content, refresh }: { content: Store; refresh: () => Promise<void> }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "ok" | "error" | "busy"; message: string }>({ kind: "idle", message: "" });

  const changePassword = async () => {
    if (next !== confirm) {
      setState({ kind: "error", message: "The two new passwords do not match." });
      return;
    }
    setState({ kind: "busy", message: "Updating…" });
    const r = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const d = (await r.json()) as { ok?: boolean; error?: string };
    if (d.ok) {
      setState({ kind: "ok", message: "Password updated. Use it next time you sign in." });
      setCurrent("");
      setNext("");
      setConfirm("");
      await refresh();
    } else {
      setState({ kind: "error", message: d.error ?? "Could not update the password." });
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Admin password, data backup and where the content is stored.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-base font-extrabold text-navy-900">Admin password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Change the password used to open this dashboard. It is stored as a salted PBKDF2 hash — never in plain text.
        </p>
        <div className="mt-4 grid gap-3 sm:max-w-md">
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Current password</span>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-700" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-slate-500">New password</span>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-700" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-slate-500">Repeat new password</span>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-700" />
          </label>
          <button
            type="button"
            onClick={() => void changePassword()}
            disabled={!current || next.length < 8 || state.kind === "busy"}
            className={cn(
              "inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition",
              current && next.length >= 8 ? "bg-navy-800 hover:bg-navy-900" : "cursor-not-allowed bg-slate-300",
            )}
          >
            {state.kind === "busy" ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Update password
          </button>
          {state.message ? (
            <p className={cn("text-sm font-semibold", state.kind === "ok" ? "text-emerald-600" : state.kind === "error" ? "text-rose-600" : "text-slate-500")}>
              {state.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-base font-extrabold text-navy-900">Data & backups</h2>
        <p className="mt-1 text-sm text-slate-500">
          Content and submissions live in a single JSON file on the server, so a download is a complete backup.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/api/admin/export?type=all&format=json" className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-900">
            Download everything (JSON)
          </a>
          {(
            [
              ["contact", "Contact messages"],
              ["register", "Registrations"],
              ["newsletter", "Newsletter list"],
            ] as const
          ).map(([type, label]) => (
            <a
              key={type}
              href={`/api/admin/export?type=${type}&format=csv`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {label} (CSV)
            </a>
          ))}
        </div>
        <dl className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Content items</dt>
            <dd className="font-semibold text-slate-700">
              {content.events.length} events · {content.news.length} articles · {content.gallery.length} photos · {content.videos.length} videos ·{" "}
              {content.faqs.length} FAQs · {content.programmes.length} programmes
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Last content update</dt>
            <dd className="font-semibold text-slate-700">{new Date(content.updatedAt).toLocaleString("en-GB")}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-display text-base font-extrabold text-amber-900">Turning on real email delivery</h2>
        <p className="mt-1 text-sm text-amber-900/80">
          Replies and form notifications are logged to the server console until you add a Resend API key. Add{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">RESEND_API_KEY</code> and{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">CONTACT_TO_EMAIL</code> in Hostinger&apos;s
          Environment Variables panel and every submission will land in the inbox and in this dashboard.
        </p>
      </section>
    </div>
  );
}
