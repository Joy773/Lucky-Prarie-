import OrderDetails from "@/components/Orders/OrderDetails";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/Navbar";

export default function OrdersPage() {
  return (
    <>
      <Navbar />
      <MobileNav />
      <main className="flex-1">
        <OrderDetails />
      </main>
      <Footer />
    </>
  );
}
