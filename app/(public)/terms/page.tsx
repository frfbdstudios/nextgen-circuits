import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Go Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Last updated: January 7, 2026
          </p>

          <div className="space-y-8 text-gray-700">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                Welcome to NextGen Circuits. By accessing or purchasing from our online store, you agree to be bound by these Terms & Conditions. Please read them carefully before placing an order.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Eligibility
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Customers must be at least 12 years old or have parental/guardian consent.</li>
                <li>Orders placed with false information may be cancelled.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. Products
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>We sell electronics, robotics kits, parts, and accessories.</li>
                <li>Product images are for illustration only; actual items may vary slightly.</li>
                <li>Specifications and prices are subject to change without notice.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Pricing & Payment
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>All prices are displayed in Taka (৳).</li>
                <li>We accept payment methods: bKash & cash on delivery.</li>
                <li>The shop reserves the right to cancel an order in case of pricing errors or fraudulent activity.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Orders & Confirmation
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>An order is confirmed only when you provide your details information.</li>
                <li>For any order above ৳4,999, half of the payment must be done to confirm order.</li>
                <li>You will receive an order confirmation via email/SMS.</li>
                <li>We may refuse or cancel orders at our discretion.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Shipping & Delivery
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Delivery timelines are estimates and may vary depending on location and availability.</li>
                <li>We are not responsible for delays caused by courier services or unforeseen events.</li>
                <li>Risk of product damage passes to the customer upon delivery.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Returns & Refunds
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Returns are accepted only for wrong items delivered, within 1 day of receipt.</li>
                <li>Items must be unused and in original packaging.</li>
                <li>Refunds will be processed to the original payment method (excluding shipping costs).</li>
                <li>Customized or clearance products are non-refundable.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Warranty
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Warranty available only for those products which have manufacturer warranty.</li>
                <li>Warranty does not cover damage caused by misuse, modification, or improper handling.</li>
                <li>Proof of purchase is required for warranty claims.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Customer Responsibilities
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Ensure correct delivery address and contact details.</li>
                <li>During opening the boxes, a video of the product must be recorded to claim refund for wrong product.</li>
                <li>Use products responsibly and as intended.</li>
                <li>Comply with local laws when using robotics devices (especially drones, cameras, or wireless modules).</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. Limitation of Liability
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>We are not liable for indirect, incidental, or consequential damages arising from product use.</li>
                <li>Our total liability shall not exceed the price paid for the product.</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                11. Privacy Policy
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Customer data will be collected for order processing, delivery, and after-sales service.</li>
                <li>We share customer information with courier service provider with the consent of the customer.</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                12. Intellectual Property
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>All website & social media content (images, logos, product descriptions) is owned by NextGen Circuits.</li>
                <li>Unauthorized reproduction or use is prohibited.</li>
              </ul>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                13. Amendments
              </h2>
              <p className="leading-relaxed">
                We reserve the right to update or modify these Terms & Conditions without prior notice. Customers are advised to review them regularly.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                14. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms & Conditions shall be governed by the laws of Bangladesh.
              </p>
            </section>

            {/* Contact Information */}
            <section className="pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at{" "}
                <a href="mailto:support@nextgencircuits.com" className="text-blue-600 hover:underline">
                  support@nextgencircuits.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}