import ContactForm from "./components/contact-form";
import ContactHero from "./components/contact-hero";
import ContactInfo from "./components/contact-info";
import { MapContainer } from "./components/map-container";


export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <main className="grow">
        <ContactHero />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
            <ContactInfo />
            {/* <ContactForm /> */}
          </div>
          <MapContainer />

        </section>
      </main>

    </div>
  )
}
