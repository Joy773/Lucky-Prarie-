import AdminShell from "@/components/Admin/AdminShell";
import Drivers from "@/components/Admin/Drivers";

export default function AdminDriversPage() {
  return (
    <AdminShell>
      <main className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
          <p className="mt-2 text-sm text-slate-600">Manage delivery drivers.</p>
        </header>
        <Drivers />
      </main>
    </AdminShell>
  );
}
