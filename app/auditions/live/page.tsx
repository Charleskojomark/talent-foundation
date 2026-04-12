"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Video, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "An unexpected error occurred.";

const LiveAuditionRoom = dynamic(() => import("@/components/auditions/LiveAuditionRoom"), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
    )
});

export default function LiveAuditionPage() {
    const [email, setEmail] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");
    const [roomData, setRoomData] = useState<{
        token: string;
        appId: string;
        channelName: string;
        uid: string;
        contestantName: string;
        assignedSong: string;
    } | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        setError("");

        try {
            // 1. Fetch contestant details
            const { data, error: fetchError } = await supabase
                .from("registrations")
                .select("*")
                .ilike("email", email.trim())
                .order("created_at", { ascending: false });

            const contestant = data?.[0];

            if (fetchError || !contestant) {
                throw new Error("Contestant not found. Please ensure you are using the correct email.");
            }

            if (contestant.current_stage !== 'live_audition_scheduled') {
                throw new Error("You are not currently scheduled for a live audition. Please check your status or contact support.");
            }

            const channelName = contestant.live_audition_room_id || `audition_${contestant.id}`;
            const uid = Math.floor(Math.random() * 1000000).toString();

            // 2. Fetch Agora Token
            const tokenRes = await fetch(`/api/agora-token?channelName=${channelName}&uid=${uid}&role=publisher`);
            const { token, appId } = await tokenRes.json();

            if (!token) throw new Error("Failed to generate access token. Please try again.");

            setRoomData({
                token,
                appId,
                channelName,
                uid,
                contestantName: contestant.full_name,
                assignedSong: contestant.live_audition_song || "Any Song (Song of Choice)"
            });

        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setIsVerifying(false);
        }
    };

    if (roomData) {
        return (
            <LiveAuditionRoom
                {...roomData}
                onLeave={() => setRoomData(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(223,177,75,0.05)_0%,transparent_70%)]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative z-10 shadow-2xl"
            >
                <div className="w-20 h-20 bg-gradient-to-tr from-gold to-gold-light rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-gold/20 rotate-3">
                    <Video className="w-10 h-10 text-black" />
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black mb-3">Live Audition <span className="text-gold">Room</span></h1>
                    <p className="text-gray-400 text-sm">Enter your registered email to join your scheduled live audition.</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all text-center text-lg"
                            required
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        disabled={isVerifying}
                        className="w-full bg-gradient-to-tr from-gold to-gold-light py-4 rounded-2xl text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-gold/10"
                    >
                        {isVerifying ? (
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>Join Audition <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Mic size={18} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest">Audio Checked</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Video size={18} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest">Video Ready</span>
                    </div>
                </div>
            </motion.div>

            <p className="mt-8 text-zinc-500 text-xs relative z-10">
                Facing issues? Contact <a href="mailto:support@talentfoundation.com" className="text-gold">Technical Support</a>
            </p>
        </div>
    );
}
