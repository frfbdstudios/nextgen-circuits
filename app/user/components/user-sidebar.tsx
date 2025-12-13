"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, ShoppingCart, User, Settings, Menu, X } from "lucide-react";

const menuItems = [
  {
    title: "MAIN",
    items: [
      {
        title: "Dashboard",
        url: "/user",
        icon: Home,
      },
    ],
  },
  {
    title: "MY ACCOUNT",
    items: [
      { title: "My Orders", url: "/user/orders", icon: ShoppingCart },
      { title: "My Profile", url: "/user/profile", icon: User },
      // { title: "Settings", url: "/user/settings", icon: Settings },
    ],
  },
];

export function UserSidebar() {
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

      <aside className={`user-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header" style={{ padding: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <Link href="/products" className="logo-text" onClick={closeMobileMenu}>
            <span className="next" style={{ fontWeight: "bold" }}>Nextgen</span> <span className="circuits" style={{ fontWeight: "normal" }}>Circuits</span>
          </Link>
          <div className="admin-title">
            <h2 style={{ fontSize: "0.9rem", margin: "10px 0 0 0", opacity: 0.8 }}>User Dashboard</h2>
          </div>
        </div>
        
        <nav className="sidebar-menu" style={{ padding: "20px 0", display: "flex", flexDirection: "column" }}>
          {menuItems.map((group) => (
            <div key={group.title} className="menu-section" style={{ marginBottom: "20px" }}>
              <label className="menu-label" style={{ display: "block", padding: "0 20px", marginBottom: "10px", fontSize: "0.8rem", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "1px" }}>
                {group.title}
              </label>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url || (item.url === "/user" && pathname === "/user");
                
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={`menu-item ${isActive ? "active" : ""}`}
                    onClick={closeMobileMenu}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 20px",
                      color: isActive ? "white" : "rgba(255, 255, 255, 0.7)",
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                      fontSize: "0.95rem",
                      backgroundColor: isActive ? "var(--user-sidebar-active)" : "transparent",
                      borderLeft: isActive ? "4px solid #2ecc71" : "4px solid transparent",
                    }}
                  >
                    <i style={{ marginRight: "10px", width: "20px", textAlign: "center" }}>
                      <Icon size={20} />
                    </i>
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

