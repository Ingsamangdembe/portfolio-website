import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Ingsom Limbu | Photography",
  description: "Photography portfolio by Ingsom Limbu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="navbar">
          <Link href="/" className="logo">
            Ingsom
          </Link>

          <nav>
            <Link href="/">Home</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </header>

        {children}

        <footer className="footer">
          <p>© {new Date().getFullYear()} Ingsom Limbu</p>
        </footer>
      </body>
    </html>
  );
}