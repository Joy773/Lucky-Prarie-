import AdminShell from "@/components/Admin/AdminShell";
import InventoryProducts from "@/components/Admin/InventoryProducts";

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <main className="space-y-6">
        <header className="max-w-4xl">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            All Products
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:mt-2">
            Manage your product catalog.
          </p>
        </header>
        <InventoryProducts />
      </main>
    </AdminShell>
  );
}
