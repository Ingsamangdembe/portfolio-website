import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Ingsom Limbu | Photography",
  description: "Photography portfolio by Ingsom Limbu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {children}

        <footer className="footer">
          <p>© {new Date().getFullYear()} Ingsom Limbu</p>
        </footer>
      </body>
    </html>
  );
}