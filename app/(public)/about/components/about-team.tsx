"use client"

import { motion } from "framer-motion"
import { Linkedin, Twitter, Facebook, User } from "lucide-react"
import Image from "next/image"

export default function AboutTeam() {
  const teamMembers = [
    {
      name: "Md. Mahin Rahman",
      // role: "Founder & CEO",
      // image: "https://via.placeholder.com/300x300?text=Fahim+Rafi",
      delay: 0.1,
    },
    {
      name: "Habibur Rahman",
      // role: "Technical Director",
      // image: "https://via.placeholder.com/300x300?text=Priya+Sharma",
      delay: 0.2,
    },
    {
      name: "Fahim Faisal Rafi",
      // role: "Operations Manager",
      // image: "https://via.placeholder.com/300x300?text=Kamal+Hassan",
      delay: 0.3,
    },
    {
      name: "Towhidul Shanto",
      // role: "Customer Support Lead",
      // image: "https://via.placeholder.com/300x300?text=Nadia+Islam",
      delay: 0.4,
    },
    {
      name: "Jamil Ahmed",
      // role: "Customer Support Lead",
      // image: "https://via.placeholder.com/300x300?text=Nadia+Islam",
      delay: 0.5,
    },
  ]

  return (
    <section className="py-12 mb-20">
      <div className="max-w-6xl mx-auto px-4 text-left">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 relative inline-block pb-4 group"
          style={{ color: 'var(--heading-blue)' }}
        >
          Meet Our Team
          <span
            className="absolute bottom-0 left-0 h-[3px] w-20 transition-all duration-300 hover:w-48 group-hover:w-48"
            style={{ background: `linear-gradient(to right, var(--accent-cyan), var(--hero-bg))` }}
          />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl text-lg leading-relaxed"
          style={{ color: 'var(--text-gray)' }}
        >
          The passionate individuals behind Nextgen Circuits who work tirelessly to serve our community:
        </motion.p>

        <div className="flex flex-wrap justify-center gap-10 mt-10">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: member.delay }}
              viewport={{ once: true }}
              className="team-member relative rounded-sm overflow-hidden transition-all duration-400 hover:-translate-y-2 group w-[280px]"
              style={{ backgroundColor: 'var(--background)', boxShadow: '0 5px 20px var(--shadow-medium)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 15px 30px var(--shadow-medium)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 5px 20px var(--shadow-medium)' }}
            >
              {/* Bottom line */}
              <div
                className="absolute bottom-0 z-40 left-0 w-0 h-[3px] group-hover:w-full transition-all duration-300"
                style={{ background: `linear-gradient(to right, var(--accent-cyan), var(--hero-bg))` }}
              />

              {/* Image */}
              <div className="flex grow items-center justce member-image relative h-[280px] overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <Image
                  // src={member.image}
                  src={'user.jpg'}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="member-info p-[25px_20px] text-center relative transition-colors duration-300" style={{ backgroundColor: 'var(--background)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-very-light-gray)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--background)' }}>
                <h3 className="text-[1.4rem] mb-2 transition-colors duration-300" style={{ color: 'var(--hero-text)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-cyan)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--hero-text)' }}>
                  {member.name}
                </h3>
                {/* <p className="mb-4 font-medium text-[1.05rem]" style={{ color: 'var(--accent-cyan)' }}>{member.role}</p> */}

                {/* <div className="social-links flex justify-center gap-4">
                  {[
                    { Icon: Linkedin, name: 'linkedin', color: '#0A66C2' },
                    { Icon: Twitter, name: 'twitter', color: '#1DA1F2' },
                    { Icon: Facebook, name: 'facebook', color: '#1877F2' },
                  ].map(({ Icon, name, color }, i) => (
                    <a
                      key={i}
                      href="#"
                      aria-label={name}
                      className={
                        `w-9 h-9 rounded-full flex items-center justify-center bg-white text-[#777] shadow-[0_5px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-[3px]`
                      }
                      // apply hover color via inline style on hover using onMouseEnter/Leave would be heavier; instead use inline style for boxShadow and set CSS variable for hover
                      style={{}}
                    >
                      <Icon className="w-4 h-4" style={{ transition: 'color .2s ease' }} />
                      <style jsx>{`
                        a[aria-label=${name}]:hover { background: ${color}; color: #fff; }
                        a[aria-label=${name}]:hover svg { color: #fff; }
                      `}</style>
                    </a>
                  ))}
                </div> */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
