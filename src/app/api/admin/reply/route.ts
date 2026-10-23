import { NextResponse } from "next/server";
import { escapeHtml, officeInbox, renderReply, sendMail } from "@/lib/mail";
import { getSubmission, recordReply, type EmailStatus } from "@/lib/store";
import { logDbError, publicError } from "@/lib/db";
import { NO_STORE_HEADERS, requireAdmin, txt } from "@/lib/security";

export const dynamic = "force-dynamic";

/** Sends a reply to a contact message or a registration and records what really happened. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as
    | { type?: "contact" | "register"; id?: string; subject?: string; message?: string }
    | null;
  const type = body?.type;
  const id = txt(body?.id, 100);
  const subject = txt(body?.subject, 255);
  const message = txt(body?.message, 20_000);
  if ((type !== "contact" && type !== "register") || !id || !subject || !message) {
    return NextResponse.json({ ok: false, error: "type, id, subject and message are required" }, { status: 400 });
  }

  try {
    const item = await getSubmission(type, id);
    if (!item?.email) return NextResponse.json({ ok: false, error: "Submission not found" }, { status: 404 });

    const result = await sendMail({
      subject,
      to: item.email,
      replyTo: officeInbox(),
      html: renderReply(escapeHtml(message).replace(/\n/g, "<br/>")),
    });
    const emailStatus: EmailStatus = result.dev ? "logged_only" : result.ok ? "sent" : "failed";
    await recordReply(type, id, { subject, body: message, emailStatus });

    if (emailStatus === "failed") {
      return NextResponse.json(
        { ok: false, error: "The email provider did not accept the reply, so nothing was delivered. It is recorded on the entry as failed — try again, or use “Open in mail app”." },
        { status: 502, headers: NO_STORE_HEADERS },
      );
    }
    return NextResponse.json({ ok: true, delivered: emailStatus === "sent", dev: emailStatus === "logged_only" }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    logDbError("reply", error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }
}
