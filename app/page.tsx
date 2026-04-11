import Hero from "@/components/home/Hero";
import { HomeSearchProvider } from "@/components/home/HomeSearchContext";
import PremiumPacks from "@/components/home/PremiumPacks";
import CTA from "@/components/home/CTA";
import Reviews from "@/components/home/Reviews";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <MobileNav />
      <HomeSearchProvider>
        <Hero />
        <PremiumPacks />
      </HomeSearchProvider>
      <Reviews />
      <CTA />
      <Footer />
    </div>
  );
}
