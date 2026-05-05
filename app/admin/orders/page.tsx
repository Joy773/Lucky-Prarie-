import AdminShell from "@/components/Admin/AdminShell";
import AllOrders from "@/components/Admin/AllOrders";

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <main className="space-y-5 sm:space-y-6">
        <header className="max-w-4xl">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Orders
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:mt-2">
            View and manage customer orders.
          </p>
        </header>
        <AllOrders />
      </main>
    </AdminShell>
  );
}
