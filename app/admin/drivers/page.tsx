import AdminShell from "@/components/Admin/AdminShell";
import Drivers from "@/components/Admin/Drivers";

export default function AdminDriversPage() {
  return (
    <AdminShell>
      <main className="space-y-5 sm:space-y-6">
        <header className="max-w-4xl">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Drivers
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:mt-2">
            Manage delivery drivers.
          </p>
        </header>
        <Drivers />
      </main>
    </AdminShell>
  );
}
