import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <p className="small-text">Photography Portfolio</p>
        <h1>Ingsom Limbu</h1>

        <div className="hero-buttons">
          <Link href="/gallery" className="button">
            View Gallery
          </Link>
          <Link href="/about" className="button secondary">
            About Me
          </Link>
        </div>
      </section>
    </main>
  );
}