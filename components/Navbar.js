"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="navbar">
      <Link href="/" className="logo" onClick={closeMenu}>
        INGSOM
      </Link>

      <button
        className={`menu-button ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
      </button>

      {menuOpen && (
        <div className="menu-overlay">
          <nav className="mobile-menu">
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>
            <Link href="/gallery" onClick={closeMenu}>
              Gallery
            </Link>
            <Link href="/about" onClick={closeMenu}>
              About
            </Link>
            <Link href="/contact" onClick={closeMenu}>
              Contact
            </Link>
            <Link href="/admin" onClick={closeMenu}>
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}