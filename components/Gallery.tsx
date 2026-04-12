"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Film, Image as ImageIcon, Play, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

type GalleryItem = {
  id: string;
  url: string;
  type: "image" | "video";
  caption: string;
  is_featured: boolean;
};

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("gallery")
          .select("*")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Gallery Fetch Error:", fetchError);
          setError(fetchError.message);
          return;
        }

        if (data) {
          setItems(data);
        }
      } catch (err) {
        console.error("Gallery Error:", err);
        setError("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 600 : 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (error) {
    return (
      <section id="gallery" className="py-24 md:py-32 bg-black border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
            <Sparkles className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-white">
            Gallery Temporary <span className="text-red-500">Unavailable</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed mb-8">
            We encountered a small glitch while loading our visual testament. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!loading && items.length === 0) {
    // Show a beautiful "Coming Soon" or empty state instead of nothing
    return (
      <section id="gallery" className="py-24 md:py-32 bg-black border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block p-4 rounded-full bg-gold/5 border border-gold/10 mb-8"
          >
            <Sparkles className="w-8 h-8 text-gold animate-pulse" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">
            Moments In <span className="text-gradient-gold">Progress</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
            We're currently curating the most inspiring moments from our journey. Stay tuned for breathtaking performances and exclusive highlights.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="gallery"
      className="py-24 md:py-32 relative bg-black border-y border-white/5 overflow-hidden"
    >
      {/* Immersive Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 mb-16 md:mb-24 flex flex-col md:flex-row items-end justify-between gap-8">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-gold text-xs font-black tracking-[0.4em] uppercase mb-4 block"
          >
            Visual Testament
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter leading-none"
          >
            THE <span className="text-gradient-gold">ICON</span> GALLERY
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl font-light leading-relaxed"
          >
            A curated collection of divine talent, captured in moments of pure worship and masterclass performance.
          </motion.p>
        </div>

        {/* Navigation for Slider */}
        {items.length > 0 && (
          <div className="flex gap-4">
            <button
              onClick={() => scroll("left")}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-gold/50 hover:text-gold transition-all backdrop-blur-md group hover:bg-gold/5"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-gold/50 hover:text-gold transition-all backdrop-blur-md group hover:bg-gold/5"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Gallery Slider/Grid */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto px-6 md:px-[calc((100vw-1280px)/2)] lg:px-[calc((100vw-1280px)/2)] pb-12 snap-x snap-mandatory scrollbar-hide no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Enhanced Skeleton
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[300px] md:w-[450px] aspect-[4/5] rounded-[2.5rem] bg-white/[0.03] animate-pulse border border-white/5"
                />
              ))
            ) : (
              items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="flex-shrink-0 w-[300px] md:w-[450px] group relative snap-center"
                >
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900 group-hover:border-gold/40 transition-all duration-700 shadow-2xl group-hover:shadow-gold/10">
                    {/* Media */}
                    {item.type === "video" ? (
                      <div className="w-full h-full relative">
                        {activeVideo === item.id ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            playsInline
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center bg-black cursor-pointer group/vid"
                            onClick={() => setActiveVideo(item.id)}
                          >
                            <img
                              src={item.url.replace('.mp4', '.jpg')} // Try to show a thumbnail if possible, or use a placeholder
                              className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
                              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                            />
                            <div className="z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover/vid:scale-110 group-hover/vid:bg-gold transition-all duration-500 group-hover/vid:text-black">
                              <Play className="w-8 h-8 fill-current ml-1" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          console.error("Image load fail:", item.url);
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/450x600?text=Image+Unavailable';
                        }}
                      />
                    )}

                    {/* Gradient Overlays */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="p-2 rounded-xl bg-gold/90 text-black shadow-lg">
                          {item.type === "video" ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                        </span>
                        {item.is_featured && (
                          <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                            Prime Pick
                          </span>
                        )}
                      </div>
                      <p className="text-white font-bold text-xl md:text-2xl leading-tight group-hover:text-gold-light transition-colors line-clamp-3">
                        {item.caption || "Gospel Icon Highlight"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}