import AdminShell from "@/components/Admin/AdminShell";
import AllOrders from "@/components/Admin/AllOrders";

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <main className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-2 text-sm text-slate-600">View and manage customer orders.</p>
        </header>
        <AllOrders />
      </main>
    </AdminShell>
  );
}
