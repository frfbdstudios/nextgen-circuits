import { Card } from "@/components/ui/card"

export function MapContainer() {
  return (
    <Card className="mt-16 overflow-hidden h-96 border-0" style={{ backgroundColor: 'var(--background)' }}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.1559926011505!2d90.35909587448872!3d23.813051386369832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c12723de267d%3A0xce52f140529e99e5!2zUGxvdCAjMTUsIDE2IOCmsOCmvuCmuOCnjeCmpOCmvi00LCBEaGFrYSAxMjE2!5e0!3m2!1sen!2sbd!4v1765595273306!5m2!1sen!2sbd"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
      />
    </Card>
  )
}
