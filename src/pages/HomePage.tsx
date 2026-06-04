import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import HeroBanner from '../sections/HeroBanner';
import CategorySection from '../sections/CategorySection';
import { FlashSaleSection, FeaturedProductsSection } from '../sections/FeaturedProducts';
import { useState } from 'react';

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main>
        <HeroBanner />
        <CategorySection />
        <FlashSaleSection />
        <FeaturedProductsSection />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
