"use client";

import Link from "next/link";
import { Music, Mic2, FileAudio } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";
import Gallery from "@/components/Gallery";

export default function Home() {
  return (
    <main className="bg-black text-white selection:bg-gold/30 selection:text-gold-light">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full glass z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="text-2xl font-black tracking-tighter text-gradient-gold">
            GOSPEL<span className="text-white">ICON</span>
          </Link>

          <div className="space-x-8 hidden md:flex text-sm font-medium text-gray-300">
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#categories" className="hover:text-gold transition-colors">Categories</a>
            <a href="#prizes" className="hover:text-gold transition-colors">Prizes</a>

          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/tickets"
              className="hidden md:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold tracking-wide text-white border border-white/20 bg-white/5 hover:bg-white/10 hover:border-gold/30 rounded-full transition-all duration-300"
            >
              <span>Buy Tickets</span>
            </Link>
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold tracking-wide text-black bg-gradient-to-tr from-gold to-gold-light rounded-full overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(223,177,75,0.3)] hover:shadow-[0_0_30px_rgba(223,177,75,0.5)]"
            >
              <span>Register Now</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          <AnimateIn delay={0.1}>
            <span className="inline-block py-1 px-3 rounded-full border border-gold/30 bg-gold/10 text-gold text-sm font-semibold tracking-widest uppercase mb-6">
              TOUCH OF AN ANGEL FOUNDATION PRESENTS
            </span>
          </AnimateIn>

          <AnimateIn delay={0.2}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
              THE GOSPEL <br className="md:hidden" />
              <span className="text-gradient-gold">ICON</span>
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <p className="text-xl md:text-2xl mb-10 text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
              SEASON 2 (TALENT HUNT EDITION)
            </p>
          </AnimateIn>

          <AnimateIn delay={0.3}>
            <p className="text-xl md:text-2xl mb-10 text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
              Discovering and promoting gifted young ministers in music, spoken word, and instrumental performance.
            </p>
          </AnimateIn>

          <AnimateIn delay={0.4} className="flex flex-col sm:flex-row gap-4 items-center mt-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold tracking-wide text-black bg-gradient-to-tr from-gold to-gold-light rounded-full overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(223,177,75,0.4)] w-full sm:w-auto"
            >
              Start Registration
            </Link>
            <Link
              href="/tickets"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold tracking-wide text-white border border-white/20 bg-white/5 rounded-full overflow-hidden hover:bg-white/10 hover:border-gold/30 transition-all duration-300 w-full sm:w-auto"
            >
              Buy Tickets
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimateIn>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              A Platform For <span className="text-gradient-gold">Purpose</span>
            </h2>
          </AnimateIn>

          <AnimateIn delay={0.2}>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-6">
              The Gospel Icon is a faith-based talent competition created to
              discover and promote gifted young ministers. Organized by Touch of an Angel Foundation,
              we provide a platform for passionate gospel talents to showcase their gifts,
              inspire audiences, and grow.
            </p>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              Season 1 successfully revealed incredible talents and Season 2
              promises to be bigger, better, and more impactful.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section id="categories" className="py-32 bg-[#050505] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <AnimateIn>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Competition Categories</h2>
              <p className="text-gray-400">Where does your calling lie?</p>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimateIn delay={0.1} className="glass p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-500 border border-white/5 hover:border-gold/30 group">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Mic2 className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Gospel Music</h3>
              <p className="text-gray-400 leading-relaxed">
                Showcase your vocal gift. Minister through songs that heal, deliver, and inspire the world.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.2} className="glass p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-500 border border-white/5 hover:border-gold/30 group">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Music className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Instrumentalist</h3>
              <p className="text-gray-400 leading-relaxed">
                Express pure worship and mastery through powerful instrumental performances.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.3} className="glass p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-500 border border-white/5 hover:border-gold/30 group">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <FileAudio className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Spoken Word</h3>
              <p className="text-gray-400 leading-relaxed">
                Deliver profound, impactful spoken word messages that stir the spirit and inspire faith.
              </p>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* PRIZES SECTION */}
      <section id="prizes" className="py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(223,177,75,0.05)_0%,transparent_100%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimateIn>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">The Rewards</h2>
              <p className="text-gray-400">Rewarding excellence in ministry</p>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-3 gap-8 items-end">

            {/* 2nd Runner Up */}
            <AnimateIn delay={0.3} className="order-2 md:order-1 glass p-8 rounded-3xl border border-white/5 hover:border-gold/20 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6 text-gray-400 font-bold text-xl">3rd</div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">2nd Runner Up</h3>
              <div className="text-3xl font-black text-white">₦100,000</div>
            </AnimateIn>

            {/* Winner */}
            <AnimateIn delay={0.1} className="order-1 md:order-2 glass p-10 md:p-12 rounded-3xl border border-gold/30 shadow-[0_0_40px_rgba(223,177,75,0.15)] flex flex-col items-center text-center transform md:-translate-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-light via-gold to-gold-light"></div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gold to-gold-light flex items-center justify-center mb-6 text-black font-black text-3xl shadow-lg">1st</div>
              <h3 className="text-2xl font-bold text-gold-light mb-2">Grand Prize Winner</h3>
              <div className="text-5xl font-black text-white mb-4">₦200,000</div>
              <p className="text-sm text-gray-400">Plus management opportunities</p>
            </AnimateIn>

            {/* 1st Runner Up */}
            <AnimateIn delay={0.2} className="order-3 md:order-3 glass p-8 rounded-3xl border border-white/5 hover:border-gold/20 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6 text-gray-300 font-bold text-xl">2nd</div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">1st Runner Up</h3>
              <div className="text-3xl font-black text-white">₦150,000</div>
            </AnimateIn>

          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <Gallery />

      {/* CTA SECTION */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gold/5 blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <AnimateIn>
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              Your Time Is <span className="text-gradient-gold">Now</span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Step onto the platform. Share the gift you've been given. Let the world hear your sound.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold tracking-wide text-black bg-gradient-to-tr from-gold to-gold-light rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(223,177,75,0.3)]"
            >
              Begin Registration
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Touch of an Angel Foundation. All rights reserved.</p>
        <p className="mt-2">The Gospel Icon Season 2</p>
      </footer>

    </main>
  );
}