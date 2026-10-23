// TEMPORARY: end-to-end check of every database/storage path from the deployed
// environment. Only answers when SELFTEST_TOKEN is set and matches ?token=.
// Removed again before the production deployment.
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import sharp from "sharp";
import {
  addContactMessage,
  addMediaFile,
  addRegistration,
  dbHealth,
  deleteSubmission,
  getAdminUser,
  getContentResult,
  getSubmission,
  getSubmissions,
  listMediaFiles,
  nextId,
  recordReply,
  saveSection,
  subscribeNewsletter,
  updateSubmission,
} from "@/lib/store";
import { db, keyKind } from "@/lib/db";
import { MEDIA_BUCKET, storagePublicUrl, uploadToStorage } from "@/lib/storage";
import { normaliseSection } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = process.env.SELFTEST_TOKEN;
  if (!token || new URL(req.url).searchParams.get("token") !== token) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const results: { step: string; ok: boolean; detail?: unknown }[] = [];
  const step = async (name: string, fn: () => Promise<unknown>) => {
    try {
      results.push({ step: name, ok: true, detail: await fn() });
    } catch (error) {
      const e = error as { message?: string; code?: string; friendly?: string };
      results.push({ step: name, ok: false, detail: { message: e.message, code: e.code, friendly: e.friendly } });
    }
  };
  const tag = `selftest-${Date.now().toString(36)}`;
  const email = `${tag}@example.com`;

  await step("key kind", async () => keyKind());
  await step("health", async () => {
    const h = await dbHealth();
    if (!h.ok) throw new Error(JSON.stringify(h));
    return h;
  });
  await step("content from database", async () => {
    const r = await getContentResult();
    if (r.source !== "database") throw new Error(`source=${r.source} ${r.error ?? ""}`);
    return { programmes: r.content.programmes.length, events: r.content.events.length, updatedAt: r.content.updatedAt };
  });
  await step("save section (faqs round trip)", async () => {
    const { content } = await getContentResult();
    return saveSection("faqs", normaliseSection("faqs", content.faqs));
  });

  const msgId = nextId("msg");
  await step("contact: insert", async () =>
    addContactMessage({ id: msgId, name: "Self Test", email, phone: "", organisation: "QA", category: "General Enquiry", subject: tag, message: "automated check" }),
  );
  await step("contact: note + status", async () => updateSubmission("contact", msgId, { status: "in-progress", note: "automated note" }));
  await step("contact: reply recorded", async () => recordReply("contact", msgId, { subject: tag, body: "automated reply", emailStatus: "logged_only" }));
  await step("contact: read back", async () => {
    const m = (await getSubmission("contact", msgId)) as { status?: string; organisation?: string; notes?: unknown[] } | null;
    if (!m || m.status !== "in-progress" || m.organisation !== "QA" || (m.notes?.length ?? 0) !== 2) throw new Error(JSON.stringify(m));
    return "ok";
  });
  await step("contact: delete", async () => deleteSubmission("contact", msgId));

  const regId = nextId("reg");
  await step("registration: insert", async () =>
    addRegistration({
      id: regId, type: "student", programme: "scispell", event: "", category: "Junior Secondary", format: "Physical",
      fullName: "Self Test", firstName: "Self", lastName: "Test", dob: "2013-01-02", gender: "", email, phone: "0800",
      school: "QA School", grade: "JSS 1", schoolLocation: "", state: "", city: "", role: "", organisation: "",
      participants: "", notes: "", guardianName: "Guardian", guardianPhone: "0801", guardianEmail: "", guardianRelationship: "Mother", consent: true,
    }),
  );
  await step("registration: read back", async () => {
    const r = (await getSubmission("register", regId)) as { programmeName?: string; school?: string; consent?: boolean } | null;
    if (!r || r.programmeName !== "SciSPELL" || r.school !== "QA School" || !r.consent) throw new Error(JSON.stringify(r));
    return "ok";
  });
  await step("registration: delete", async () => deleteSubmission("register", regId));

  await step("newsletter: subscribe twice", async () => {
    const a = await subscribeNewsletter(email, "stem-guide");
    const b = await subscribeNewsletter(email.toUpperCase(), "newsletter");
    if (a.duplicate || !b.duplicate) throw new Error(JSON.stringify({ a, b }));
    return { a, b };
  });
  await step("newsletter: delete", async () => {
    const s = (await getSubmissions()).newsletter.find((x) => x.email === email);
    if (!s) throw new Error("subscriber not found");
    return deleteSubmission("newsletter", s.id);
  });

  const file = `${tag}-${crypto.randomBytes(3).toString("hex")}.jpg`;
  await step("storage: upload", async () => {
    const jpg = await sharp({ create: { width: 64, height: 32, channels: 3, background: { r: 11, g: 42, b: 111 } } }).jpeg().toBuffer();
    await uploadToStorage(file, jpg, "image/jpeg");
    return file;
  });
  await step("storage: public read", async () => {
    const r = await fetch(storagePublicUrl(file), { cache: "no-store" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return { status: r.status, type: r.headers.get("content-type"), bytes: (await r.arrayBuffer()).byteLength };
  });
  await step("storage: media registry", async () => {
    await addMediaFile({ id: `media-${file.replace(/\.jpg$/, "")}`, fileName: file, url: `/api/media/${file}`, storage: "supabase", mimeType: "image/jpeg", sizeBytes: 1, width: 64, height: 32, originalName: "selftest.jpg" });
    const list = await listMediaFiles();
    if (!list.some((m) => m.name === file)) throw new Error("not listed");
    return "ok";
  });
  await step("storage: cleanup", async () => {
    const { error } = await db().storage.from(MEDIA_BUCKET).remove([file]);
    if (error) throw new Error(error.message);
    const { error: e2 } = await db().rpc("app_health");
    if (e2) throw new Error(e2.message);
    return "removed";
  });
  await step("admin account readable", async () => ((await getAdminUser()) ? "set" : "not set yet"));

  const ok = results.every((r) => r.ok);
  return NextResponse.json({ ok, mediaRowToRemove: `media-${file.replace(/\.jpg$/, "")}`, results }, { status: ok ? 200 : 500, headers: { "Cache-Control": "no-store" } });
}
