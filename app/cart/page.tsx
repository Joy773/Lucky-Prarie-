import CartContent from "@/components/Cart/CartContent";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/Navbar";

export default function CartPage() {
  return (
    <>
      <Navbar />
      <MobileNav />
      <main className="flex-1">
        <CartContent />
      </main>
      <Footer />
    </>
  );
}
