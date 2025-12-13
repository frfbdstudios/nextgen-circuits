"use client"

import { motion } from "framer-motion"
import { Star, Handshake, Lightbulb, GraduationCap } from "lucide-react"

export default function AboutMissionValues() {
  const values = [
    {
      icon: Star,
      title: "Quality Assurance",
      text: "We rigorously test all our products to ensure they meet the highest standards of quality and reliability.",
      delay: 0.1,
    },
    {
      icon: Handshake,
      title: "Customer First",
      text: "Your satisfaction is our priority. We're committed to providing exceptional service and support.",
      delay: 0.2,
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      text: "We continuously expand our product range to include the latest technologies and components.",
      delay: 0.3,
    },
    {
      icon: GraduationCap,
      title: "Education",
      text: "We support learning and skill development through workshops, tutorials, and educational discounts.",
      delay: 0.4,
    },
  ]

  return (
    <section className="relative py-12 mb-20" style={{ backgroundColor: 'var(--bg-light-gray)' }}>
      <div className="max-w-6xl mx-auto px-4 text-left">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6 relative inline-block pb-4 group"
          style={{ color: 'var(--heading-blue)' }}
        >
          Our Mission & Values
          <span
            className="absolute bottom-0 left-0 h-[3px] w-20 transition-all duration-300 hover:w-48 group-hover:w-48"
            style={{
              background: `linear-gradient(to right, var(--accent-cyan), var(--hero-bg))`,
            }}
          />
        </motion.h2>

        {/* Intro Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl text-lg leading-relaxed"
          style={{ color: 'var(--text-gray)' }}
        >
          At Nextgen Circuits, we&apos;re guided by a set of core principles that define who we are and how we operate:
        </motion.p>

        {/* Value Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[30px] mt-10">
          {values.map((val, i) => {
            const Icon = val.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: val.delay }}
                viewport={{ once: true }}
                className="group relative p-6 rounded-xl border-b-[3px] border-transparent hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--background)', 
                  boxShadow: '0 5px 15px var(--shadow-light)' 
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.boxShadow = '0 10px 25px var(--shadow-medium)'
                  e.currentTarget.style.borderBottomColor = 'var(--accent-cyan)'
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.boxShadow = '0 5px 15px var(--shadow-light)'
                  e.currentTarget.style.borderBottomColor = 'transparent'
                }}
              >
                {/* Gradient Accent Line */}
                <div
                  className="absolute top-0 left-0 w-[5px] h-0 group-hover:h-full transition-all duration-300"
                  style={{ background: `linear-gradient(to bottom, var(--accent-cyan), var(--heading-blue))` }}
                ></div>

                <div className="text-left">
                  <Icon className="w-10 h-10 mb-5 transition-transform duration-300 group-hover:scale-110" style={{ color: 'var(--accent-cyan)' }} />
                  <h3 className="text-xl font-semibold mb-3 transition-colors duration-300" style={{ color: 'var(--hero-text)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-cyan)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--hero-text)' }}>
                    {val.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: 'var(--text-gray-medium)' }}>{val.text}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
