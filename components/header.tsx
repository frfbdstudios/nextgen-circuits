"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingCart, Menu, X, Heart } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const [cartCount] = useState(0);
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    router.push(`/products?q=${searchQuery}`);
  }

  return (
    <header className="header bg-secondary text-secondary-foreground drop-shadow-2xl border-b border-accent/10 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="header-wrapper flex items-center justify-between py-4">
          {/* Logo */}
          <div className="logo">
            <a href="/" className="logo-text text-md md:text-2xl font-bold">
              <span className="">Next</span>
              <span className="text-accent">Gen </span>
              <span className="">Circuits</span>
            </a>
          </div>

          {/* Navigation Menu - Desktop */}
          <nav className="nav-menu hidden lg:block">
            <ul className="menu flex items-center space-x-8">
              <li>
                <a
                  href="/"
                  className={`relative inline-block font-bold transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-accent after:w-full after:origin-left after:transition-transform after:duration-300 ${isActive("/")
                      ? "text-secondary-foreground after:scale-x-100"
                      : "text-muted hover:text-secondary-foreground after:scale-x-0 hover:after:scale-x-100"
                    }`}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className={`relative inline-block font-bold transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-accent after:w-full after:origin-left after:transition-transform after:duration-300 ${isActive("/products")
                      ? "text-secondary-foreground after:scale-x-100"
                      : "text-muted hover:text-secondary-foreground after:scale-x-0 hover:after:scale-x-100"
                    }`}
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  className={`relative inline-block font-bold transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-accent after:w-full after:origin-left after:transition-transform after:duration-300 ${isActive("/categories")
                      ? "text-secondary-foreground after:scale-x-100"
                      : "text-muted hover:text-secondary-foreground after:scale-x-0 hover:after:scale-x-100"
                    }`}
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className={`relative inline-block font-bold transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-accent after:w-full after:origin-left after:transition-transform after:duration-300 ${isActive("/about")
                      ? "text-secondary-foreground after:scale-x-100"
                      : "text-muted hover:text-secondary-foreground after:scale-x-0 hover:after:scale-x-100"
                    }`}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className={`relative inline-block font-bold transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-accent after:w-full after:origin-left after:transition-transform after:duration-300 ${isActive("/contact")
                      ? "text-secondary-foreground after:scale-x-100"
                      : "text-muted hover:text-secondary-foreground after:scale-x-0 hover:after:scale-x-100"
                    }`}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          {/* Header Actions */}
          <div className="header-actions flex items-center gap-4">
            {/* Search Box - Desktop */}
            <form action="" onSubmit={handleSearchSubmit}>
              <div className="search-box hidden md:flex items-center bg-gray-100 rounded-md px-3 py-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent outline-none flex-1 text-sm text-black"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-4 h-4 text-gray-500" />
              </div>
            </form>

            {/* User Actions */}
            <div className="user-actions flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href={user ? "/user" : "/login"}>
                  <User className="w-5 h-5" />
                </a>
              </Button>

              <Button variant="ghost" size="sm" asChild className="relative">
                <a href="/cart">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </a>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <a href="/wishlist">
                  <Heart className="w-5 h-5" />
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.nav
            className="mobile-menu lg:hidden border-t py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="space-y-4">
              <li>
                <a
                  href="/"
                  className={`block transition-colors ${isActive("/")
                      ? "text-secondary-foreground font-bold"
                      : "text-muted hover:text-secondary-foreground"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className={`block transition-colors ${isActive("/products")
                      ? "text-secondary-foreground font-bold"
                      : "text-muted hover:text-secondary-foreground"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  className={`block transition-colors ${isActive("/categories")
                      ? "text-secondary-foreground font-bold"
                      : "text-muted hover:text-secondary-foreground"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className={`block transition-colors ${isActive("/about")
                      ? "text-secondary-foreground font-bold"
                      : "text-muted hover:text-secondary-foreground"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className={`block transition-colors ${isActive("/contact")
                      ? "text-secondary-foreground font-bold"
                      : "text-muted hover:text-secondary-foreground"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
              </li>
            </ul>

            {/* Mobile Search */}
            <form action="" onSubmit={handleSearchSubmit}>
              <div className="search-box flex items-center bg-gray-100 rounded-md px-3 py-2 mt-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent outline-none flex-1 text-sm text-black"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-4 h-4 text-gray-500" />
              </div>
            </form>
          </motion.nav>
        )}
      </div>
    </header>
  );
}