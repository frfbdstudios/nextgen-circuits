

import FeaturedCategories from "@/components/featured-categories";
import FeaturedProducts from "@/components/featured-products";

import Hero from "@/components/hero";
import Newsletter from "@/components/newsletter";
import WhyChooseUs from "@/components/why-choose-us";

export default function HomePage() {
  
  return (
    <div className="min-h-screen">
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