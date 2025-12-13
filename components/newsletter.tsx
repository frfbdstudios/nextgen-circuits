"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
// Using regular input instead of shadcn Input for now

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <section className="newsletter py-16 bg-primary">
      <div className="container mx-auto px-6">
        <motion.div 
          className="newsletter-content text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-blue-100 mb-8">
            Get updates on new products, special offers, and tech tips
          </p>
          <form className="newsletter-form flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" className="bg-white text-blue-600 hover:bg-gray-100">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}