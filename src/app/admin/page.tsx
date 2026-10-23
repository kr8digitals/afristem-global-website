import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminApp } from "@/components/admin/admin-app";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { loadAdminStore } from "@/lib/store";
import { mailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const jar = await cookies();
  const ok = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/login");

  // never ships the password hash to the browser
  const content = await loadAdminStore();
  return <AdminApp initialContent={content} emailConfigured={mailConfigured()} />;
}
