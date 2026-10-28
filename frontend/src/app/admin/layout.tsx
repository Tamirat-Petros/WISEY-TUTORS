import type { Metadata } from "next";
import { AdminAuthProvider } from "@/components/admin-auth-provider";
export const metadata: Metadata = { title: "Admin workspace" };
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminAuthProvider><div className="admin-shell">{children}</div></AdminAuthProvider>;
}
