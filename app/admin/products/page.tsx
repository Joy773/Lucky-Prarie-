import AdminShell from "@/components/Admin/AdminShell";
import InventoryProducts from "@/components/Admin/InventoryProducts";

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <main className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your product catalog.</p>
        </header>
        <InventoryProducts />
      </main>
    </AdminShell>
  );
}
