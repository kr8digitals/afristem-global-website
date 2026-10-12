"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, GripVertical, ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "boolean"
  | "image"
  | "document"
  | "date"
  | "number"
  | "list"
  | "tags";

export type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  options?: readonly string[];
  placeholder?: string;
  help?: string;
  rows?: number;
  span?: 1 | 2 | 3;
};

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20 disabled:bg-slate-100";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline gap-2">
      <span className="text-[12px] font-bold uppercase tracking-wide text-slate-500">{children}</span>
      {hint ? <span className="text-[11px] font-medium text-slate-400">{hint}</span> : null}
    </span>
  );
}

/* --------------------------------------------------------------- image field */

type MediaFile = { url: string; name: string };

export function ImageField({
  value,
  onChange,
  label = "Image",
  help,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  help?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setBusy(true);
      setError("");
      try {
        const body = new FormData();
        body.append("file", file);
        const r = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await r.json()) as { ok: boolean; url?: string; error?: string };
        if (!data.ok || !data.url) throw new Error(data.error ?? "Upload failed");
        onChange(data.url);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (!pickerOpen || files) return;
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d: { files?: MediaFile[] }) => setFiles(d.files ?? []))
      .catch(() => setFiles([]));
  }, [pickerOpen, files]);

  return (
    <div>
      <Label hint={help}>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-slate-400">
              <ImageIcon className="size-6" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input className={inputBase} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/… or upload" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-navy-900 disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              {busy ? "Uploading…" : "Upload"}
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ImageIcon className="size-3.5" /> Library
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
              >
                <X className="size-3.5" /> Clear
              </button>
            ) : null}
          </div>
          {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />

      {pickerOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setPickerOpen(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <p className="font-bold text-slate-800">Media library</p>
              <button type="button" onClick={() => setPickerOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-4">
              {files === null ? (
                <p className="flex items-center gap-2 p-6 text-sm text-slate-500">
                  <Loader2 className="size-4 animate-spin" /> Loading images…
                </p>
              ) : files.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No images found yet — upload one to get started.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {files.map((f) => (
                    <button
                      key={f.url}
                      type="button"
                      onClick={() => {
                        onChange(f.url);
                        setPickerOpen(false);
                      }}
                      className={cn(
                        "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-slate-100 transition",
                        value === f.url ? "border-sun-400" : "border-transparent hover:border-navy-700",
                      )}
                      title={f.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.url} alt={f.name} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ generic */

function DocumentField({ value, onChange, label, help }: { value: string; onChange: (v: string) => void; label: string; help?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return <div><label><Label>{label}</Label><input className={inputBase} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/documents/...pdf or https://..." /></label>
    <label className="mt-2 block text-sm">{busy ? "Uploading…" : "Upload replacement PDF"}<input className="ml-2 max-w-full" type="file" accept="application/pdf" disabled={busy} onChange={async (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      setBusy(true); setError("");
      try { const body = new FormData(); body.append("file", file); const r = await fetch("/api/admin/upload", { method: "POST", body }); const data = await r.json(); if (!r.ok || !data.url) throw new Error(data.error || "Upload failed"); onChange(data.url); }
      catch (error) { setError((error as Error).message); } finally { setBusy(false); }
    }} /></label>{help && <p className="mt-1 text-xs text-slate-500">{help}</p>}{error && <p role="alert" className="text-sm text-red-600">{error}</p>}</div>;
}

export function Field({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = useId();
  if (def.type === "document") return <DocumentField value={String(value ?? "")} onChange={onChange} label={def.label} help={def.help} />;
  if (def.type === "image") {
    return <ImageField value={String(value ?? "")} onChange={(v) => onChange(v)} label={def.label} help={def.help} />;
  }
  if (def.type === "boolean") {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left"
      >
        <span
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition",
            value ? "bg-emerald-500" : "bg-slate-300",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-4 rounded-full bg-white shadow transition-all",
              value ? "left-4.5" : "left-0.5",
            )}
          />
        </span>
        <span className="text-sm font-semibold text-slate-700">{value ? "Enabled" : "Disabled"}</span>
      </button>
    );
  }
  if (def.type === "textarea") {
    return (
      <label htmlFor={id} className="block">
        <Label hint={def.help}>{def.label}</Label>
        <textarea
          id={id}
          rows={def.rows ?? 4}
          className={cn(inputBase, "resize-y font-[inherit] leading-relaxed")}
          value={String(value ?? "")}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }
  if (def.type === "select") {
    return (
      <label htmlFor={id} className="block">
        <Label hint={def.help}>{def.label}</Label>
        <select id={id} className={inputBase} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {(def.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (def.type === "tags" || def.type === "list") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div>
        <Label hint={def.help ?? "One per line"}>{def.label}</Label>
        <textarea
          id={id}
          rows={def.rows ?? Math.max(3, list.length + 1)}
          className={cn(inputBase, "resize-y font-[inherit] leading-relaxed")}
          value={list.join("\n")}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      </div>
    );
  }
  return (
    <label htmlFor={id} className="block">
      <Label hint={def.help}>{def.label}</Label>
      <input
        id={id}
        type={def.type === "date" ? "date" : def.type === "number" ? "number" : "text"}
        className={inputBase}
        value={String(value ?? "")}
        placeholder={def.placeholder}
        onChange={(e) => onChange(def.type === "number" ? Number(e.target.value) : e.target.value)}
      />
    </label>
  );
}

/* ----------------------------------------------------------------- repeater */

export function Repeater<T extends { id: string }>({
  items,
  fields,
  onChange,
  itemTitle,
  itemSubtitle,
  blank,
  addLabel,
}: {
  items: T[];
  fields: FieldDef[];
  onChange: (items: T[]) => void;
  itemTitle: (item: T, index: number) => string;
  itemSubtitle?: (item: T) => string;
  blank: () => T;
  addLabel: string;
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? items.filter((i) => JSON.stringify(i).toLowerCase().includes(query.toLowerCase()))
    : items;

  const patch = (id: string, key: string, v: unknown) =>
    onChange(items.map((i) => (i.id === id ? ({ ...i, [key]: v } as T) : i)));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={cn(inputBase, "max-w-xs flex-1")}
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            const item = blank();
            onChange([item, ...items]);
            setOpen(item.id);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sun-400 px-4 py-2 text-sm font-bold text-navy-950 transition hover:bg-sun-300"
        >
          <Plus className="size-4" /> {addLabel}
        </button>
        <span className="ml-auto text-xs font-semibold text-slate-400">
          {filtered.length} of {items.length}
        </span>
      </div>

      <div className="space-y-2">
        {filtered.map((item, index) => {
          const realIndex = items.indexOf(item);
          const isOpen = open === item.id;
          return (
            <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3"
                >
                  <ChevronDown className={cn("size-4 shrink-0 text-slate-400 transition", isOpen && "rotate-180")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-800">{itemTitle(item, realIndex)}</span>
                    {itemSubtitle ? <span className="block truncate text-xs text-slate-400">{itemSubtitle(item)}</span> : null}
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(realIndex, -1)}
                    className="hidden rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:block"
                    title="Move up"
                  >
                    <GripVertical className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {isOpen ? (
                <div className="grid gap-4 border-t border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2">
                  {fields.map((f) => (
                    <div
                      key={f.key}
                      className={cn(
                        f.span === 2 && "sm:col-span-2",
                        f.span === 3 && "sm:col-span-2",
                        f.type === "textarea" && !f.span && "sm:col-span-2",
                      )}
                    >
                      <Field def={f} value={(item as Record<string, unknown>)[f.key]} onChange={(v) => patch(item.id, f.key, v)} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Nothing here yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ section shell */

export function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-800">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
  savedAt,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
  savedAt?: string;
}) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <span className={cn("text-sm font-semibold", dirty ? "text-amber-600" : "text-slate-400")}>
        {saving ? "Saving…" : dirty ? "Unsaved changes" : savedAt ? `Saved ${savedAt}` : "All changes saved"}
      </span>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Reset to defaults
        </button>
      ) : null}
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className={cn(
          "rounded-lg px-5 py-2 text-sm font-bold text-white transition",
          dirty && !saving ? "bg-navy-800 hover:bg-navy-900" : "cursor-not-allowed bg-slate-300",
          !onReset && "ml-auto",
        )}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
