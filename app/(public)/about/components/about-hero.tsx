"use client"

import { motion } from "framer-motion"

export default function AboutHero() {
  return (
    <section
      className="relative overflow-hidden py-20 text-center shadow-lg rounded-b-3xl mb-16"
      style={{
        background: `linear-gradient(135deg, var(--hero-bg) 0%, var(--hero-bg) 100%)`,
        boxShadow: `0 4px 20px var(--shadow-light)`,
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full z-0"
        style={{ background: "var(--decorative-blue)" }}
      />
      <div
        className="absolute bottom-[-50px] left-[-50px] w-[150px] h-[150px] rounded-full z-0"
        style={{ background: "var(--decorative-blue)" }}
      />

      <div className="container relative z-10 mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            color: "var(--hero-text)",
            textShadow: `1px 1px 2px var(--shadow-medium)`,
          }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          About Nextgen Circuits
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            color: "var(--text-gray)",
          }}
          className="text-lg md:text-xl max-w-2xl mx-auto"
        >
          Your trusted partner for quality electronic components and solutions in Bangladesh
        </motion.p>
      </div>
    </section>
  )
}
