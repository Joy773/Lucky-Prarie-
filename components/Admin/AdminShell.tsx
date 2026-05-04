import type { ReactNode } from "react";
import AdminSidebar from "@/components/Admin/AdminSidebar";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
