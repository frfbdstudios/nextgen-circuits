"use client";

import { motion } from "framer-motion";
import { Truck, Shield, Wallet, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "We deliver across Bangladesh within 2-3 business days"
  },
  {
    icon: Shield,
    title: "Quality Assurance", 
    description: "All products are tested and verified before shipping"
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description: "Multiple payment options including bKash and Nagad"
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Dedicated support team available 7 days a week"
  }
];

export default function WhyChooseUs() {
  return (
    <section className="why-choose-us py-16">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="text-3xl font-bold text-center text-gray-900 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Why Choose Nextgen Circuits
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="feature-card text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}