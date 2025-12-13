import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactInfo() {
  return (
    <Card className="border-0 rounded-sm" style={{ backgroundColor: 'var(--background)', boxShadow: '0 2px 8px var(--shadow-medium)' }}>
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold mb-6 relative pb-3" style={{ color: 'var(--heading-blue)' }}>
          Get In Touch
          <span className="absolute left-0 bottom-0 w-14 h-[3px]" style={{ backgroundColor: 'var(--accent-cyan)' }} />
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-gray)' }}>
          We'd love to hear from you! Whether you have a question about our
          products, need technical support, or want to place a bulk order, our
          team is ready to assist you.
        </p>

        <div className="space-y-6">
          <ContactItem
            icon={<MapPin size={22} style={{ color: 'var(--accent-cyan)' }} />}
            title="Our Location"
            lines={["Plot # 15 Block B, Bashundhara R/A, Dhaka, Bangladesh"]}
          />
          <ContactItem
            icon={<Phone size={22} style={{ color: 'var(--accent-cyan)' }} />}
            title="Phone Number"
            lines={["+880 1968-872878", "+880 1961-105658"]}
          />
          <ContactItem
            icon={<Mail size={22} style={{ color: 'var(--accent-cyan)' }} />}
            title="Email Address"
            lines={["nextgen.ckt@proton.me"]}
          />
          <ContactItem
            icon={<Clock size={22} style={{ color: 'var(--accent-cyan)' }} />}
            title="Business Hours"
            lines={[
              "Mon–Fri: 9:00 AM – 6:00 PM",
              "Sat: 10:00 AM – 4:00 PM",
              "Sun: Closed",
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ContactItem({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode
  title: string
  lines: string[]
}) {
  return (
    <div className="flex items-start gap-4 mb-12">
      <div className="pt-1">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--hero-text)' }}>{title}</h3>
        {lines.map((line, i) => (
          <p key={i} className="mb-2" style={{ color: 'var(--text-gray)' }}>
            {line}
            <br />
          </p>
        ))}
      </div>
    </div>
  )
}
