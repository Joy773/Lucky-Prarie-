import AllProducts from "@/components/Products/AllProducts";
import Category from "@/components/Products/Category";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/Navbar";
import { listStorefrontProducts } from "@/lib/storefrontProducts";
import type { ProductApiShape } from "@/models/products";

/** Avoid serving a stale RSC shell for this route in production. */
export const dynamic = "force-dynamic";

export default async function Page() {
  const catalog: ProductApiShape[] = await listStorefrontProducts().catch(
    (error: unknown) => {
      console.error("[products page] listStorefrontProducts", error);
      return [];
    }
  );

  return (
    <div>
      <Navbar />
      <MobileNav />
      <Category />
      <AllProducts initialProducts={catalog} />
      <Footer />
    </div>
  );
}
