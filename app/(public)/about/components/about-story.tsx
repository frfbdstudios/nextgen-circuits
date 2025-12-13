"use client"

// using a plain <img> with a placeholder avoids requiring external domains in next.config
import { motion } from "framer-motion"

export default function AboutStory() {
  return (
    <section className="relative py-8 mb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-8 relative pb-4 inline-block"
          style={{ color: 'var(--heading-blue)' }}
        >
          Our Story
          <span
            className="absolute bottom-0 left-0 h-[3px] w-20 transition-all duration-300"
            style={{
              background: `linear-gradient(to right, var(--accent-cyan), var(--hero-bg))`,
            }}
          ></span>
        </motion.h2>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-5"
            style={{ color: 'var(--text-gray)' }}
          >
            <p>
              Founded in 2015, Nextgen Circuits began with a simple mission: to
              provide high-quality electronic components to enthusiasts,
              students, and professionals in Bangladesh at affordable prices.
            </p>
            <p>
              What started as a small shop in Dhaka has now grown into one of
              the country's leading suppliers of electronic components,
              development boards, sensors, and accessories. Our journey has been
              driven by our passion for technology and our commitment to
              supporting the growing maker community in Bangladesh.
            </p>
            <p>
              Today, we serve thousands of customers nationwide, from hobbyists
              working on DIY projects to educational institutions and tech
              companies building innovative solutions. We take pride in being a
              catalyst for technological innovation and education in our
              country.
            </p>
          </motion.div>

          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <div className="overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <img
                src="/our-story.jpg"
                alt="Nextgen Circuits Story"
                width={600}
                height={400}
                className="object-cover w-full h-auto"
                onError={(e) => { const t = e.target as HTMLImageElement; t.src = 'https://via.placeholder.com/600x400?text=Our+Story' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
