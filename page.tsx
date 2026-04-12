import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-black text-white text-center py-32 px-6">
        <h1 className="text-5xl font-bold mb-6">
          Talent Foundation Competition 2026
        </h1>

        <p className="text-lg mb-8">
          Music • Instrumentalist • Spoken Word
        </p>

        <Link
          href="/register"
          className="bg-white text-black px-8 py-3 rounded font-semibold"
        >
          Register Now
        </Link>
      </section>
    </div>
  );
}
