import Header from "./header";
import Hero from "./hero";
import FeaturedCategories from "./featured-categories";
import FeaturedProducts from "./featured-products";
import WhyChooseUs from "./why-choose-us";
import Newsletter from "./newsletter";
import Footer from "./footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedCategories />
        <FeaturedProducts />
        <WhyChooseUs />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}