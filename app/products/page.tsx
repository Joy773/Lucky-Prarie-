import AllProducts from "@/components/Products/AllProducts";
import Category from "@/components/Products/Category";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/Navbar";

export default function Page() {
  return (
  <div>
    <Navbar />
    <MobileNav />
    <Category />
    <AllProducts />
    <Footer />
  </div>
  );
}
