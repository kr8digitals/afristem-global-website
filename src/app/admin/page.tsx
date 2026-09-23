import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminApp } from "@/components/admin/admin-app";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const jar = await cookies();
  const ok = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/login");

  const store = readStore();
  // never ship the password hash to the browser
  const content = { ...store, admin: { user: store.admin.user ? { updatedAt: store.admin.user.updatedAt, passwordHash: "", salt: "" } : null } };
  return <AdminApp initialContent={content} />;
}
