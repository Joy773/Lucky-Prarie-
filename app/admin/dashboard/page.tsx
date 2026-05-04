import AdminShell from "@/components/Admin/AdminShell";

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <main>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Welcome to the admin dashboard.</p>
      </main>
    </AdminShell>
  );
}
