

import FeaturedCategories from "@/components/featured-categories";
import FeaturedProducts from "@/components/featured-products";

import Hero from "@/components/hero";
import Newsletter from "@/components/newsletter";
import { PopupBannerModal } from "@/components/popup-banner";
import WhyChooseUs from "@/components/why-choose-us";

export default function HomePage() {
  
  return (
    <div className="min-h-screen">
      <PopupBannerModal />
      <main>
        <Hero />
        <FeaturedCategories />
        <FeaturedProducts />
        {/* <WhyChooseUs /> */}
        {/* <Newsletter /> */}
      </main>
    </div>
  );
}