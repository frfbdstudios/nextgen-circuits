"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CometCard } from "@/components/ui/comet-card";

export default function Hero() {

  return (
    <section className="hero py-20 bg-secondary text-secondary-foreground rounded-b-4xl">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl lg:text-6xl font-bold mb-6 leading-tight tracking-tighter drop-shadow-[2px_2px_4px_rgba(0,0,0,0.2)] bg-linear-to-r from-white to-sky-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Quality Electronic Components at Affordable Prices
            </motion.h1>
            <motion.p 
              className="text-lg lg:text-xl mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover a wide range of electronic components, modules, and accessories for your projects.
            </motion.p>
            <motion.div 
              className="hero-buttons flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button asChild size="lg" variant={'hero-primary'} className="text-lg py-6 rounded-full duration-300">
                <Link href="/categories">Shop Now</Link>
              </Button>
              <Button asChild variant="hero-secondary" size="lg" className="text-lg py-6 rounded-full duration-300">
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div 
            className="hero-image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <CometCard rotateDepth={10} translateDepth={10} className="w-fit">
              <Image
                src="/hero.jpg"
                alt="Electronic Components"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
                priority
              />
            </CometCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}