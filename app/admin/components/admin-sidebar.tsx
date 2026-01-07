"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LineChart,
  Box,
  Folder,
  ShoppingCart,
  Warehouse,
  Users,
  FileText,
  Megaphone,
  BarChart3,
  Headphones,
  ArrowLeft,
  Settings,
  Menu,
  X,
  Boxes,
  Tag,
  User2,
  User,
  PanelsTopLeft,
} from "lucide-react";

const menuItems = [
  {
    title: "MAIN",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LineChart,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { title: "Products", url: "/admin/products", icon: Box },
      { title: "Categories", url: "/admin/categories", icon: Folder },
      { title: "Category Groups", url: "/admin/category-groups", icon: Boxes },
      { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
      { title: "Customers", url: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "CONTENT & MARKETING",
    items: [
      { title: "Landing Page", url: "/admin/landing-page", icon: PanelsTopLeft },
      // { title: "Content", url: "/admin/content", icon: FileText },
      { title: "Discounts", url: "/admin/discounts", icon: Tag },
      { title: "Popup Banners", url: "/admin/popup-banners", icon: Megaphone },
      // { title: "Marketing", url: "/admin/marketing", icon: Megaphone },
    ],
  },
  // {
  //   title: "ANALYTICS & SUPPORT",
  //   items: [
  //     { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  //     { title: "Support", url: "/admin/support", icon: Headphones },
  //   ],
  // },
  {
    title: "SYSTEM",
    items: [
      { title: "Manage Admins", url: "/admin/manage-admins", icon: User },
      { title: "Back to Site", url: "/", icon: ArrowLeft },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside or on a link
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay - Only visible when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="logo-text" onClick={closeMobileMenu}>
            <span className="next">Next</span>
            <span className="gen">gen</span> <span className="circuits">Circuits</span>
          </Link>
          <div className="admin-title">
            <h2>Admin Panel</h2>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((group, groupIndex) => (
            <div key={group.title} className={`menu-section ${groupIndex === menuItems.length - 1 ? "mt-auto back-to-site" : ""}`}>
              <label className="menu-label">{group.title}</label>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url || (item.url === "/admin" && pathname === "/admin");

                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={`menu-item ${isActive ? "active" : ""}`}
                    onClick={closeMobileMenu}
                  >
                    <i><Icon size={20} /></i>
                    {item.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
