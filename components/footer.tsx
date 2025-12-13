"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <div className="footer-content py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div 
              className="footer-column"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="logo mb-4">
                <Link href="/" className="logo-text text-2xl font-bold">
                  <span className="text-blue-400">Next</span>
                  <span className="text-blue-300">Gen</span> 
                  <span className="text-white">Circuits</span>
                </Link>
              </div>
              <p className="text-gray-300 mb-6">
                Your trusted source for electronic components in Bangladesh.
              </p>
              <div className="social-links flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              className="footer-column"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="footer-links space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-gray-300 hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Customer Service */}
            <motion.div 
              className="footer-column"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="footer-links space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-300 hover:text-white transition-colors">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              className="footer-column"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="contact-info space-y-3">
                <li className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm">
                    123 Electronics Street, Dhaka, Bangladesh
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-gray-300 text-sm">+880 1234-567890</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-gray-300 text-sm">info@nextgencircuits.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-gray-300 text-sm">Open: 10:00 AM - 8:00 PM</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom border-t border-gray-800 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* <div className="payment-methods flex items-center space-x-4">
              <span className="text-gray-300 text-sm">Payment Methods:</span>
              <div className="flex space-x-2">
                <Image src="/assets/images/payment/bkash.png" alt="bKash" width={40} height={24} />
                <Image src="/assets/images/payment/nagad.png" alt="Nagad" width={40} height={24} />
                <Image src="/assets/images/payment/rocket.png" alt="Rocket" width={40} height={24} />
                <Image src="/assets/images/payment/visa.png" alt="Visa" width={40} height={24} />
                <Image src="/assets/images/payment/mastercard.png" alt="Mastercard" width={40} height={24} />
              </div>
            </div> */}
            <div className="copyright">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Nextgen Circuits. All Rights Reserved.
              </p>
            </div>
            <div className="copyright">
              <p className="text-gray-400 text-sm">
                Developed by <a href="https://chatpoka.com" target="_blank" className="hover:text-white">Chatpoka Technologies</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}