"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Save, ChevronLeft, Loader2 } from "lucide-react";
import { getContestant, saveLiveAuditionScore } from "@/app/secure-admin/actions";

const LiveAuditionRoom = dynamic(() => import("@/components/auditions/LiveAuditionRoom"), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-gold animate-spin" />
        </div>
    )
});

export default function JudgeLiveAuditionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [contestant, setContestant] = useState<any>(null);
    const [roomData, setRoomData] = useState<any>(null);
    const [scores, setScores] = useState({ vocals: 0, performance: 0, spiritual: 0 });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAudition = async () => {
            try {
                // 1. Fetch contestant
                const data = await getContestant(id);

                if (!data) throw new Error("Contestant not found");
                setContestant(data);

                // 2. Fetch token
                const channelName = data.liveAuditionRoomId || `audition_${data.id}`;
                const uid = "1"; // Judge is always UID 1 in our logic
                const tokenRes = await fetch(`/api/agora-token?channelName=${channelName}&uid=${uid}&role=publisher`);
                const { token, appId } = await tokenRes.json();

                setRoomData({
                    token,
                    appId,
                    channelName,
                    uid,
                    contestantName: data.fullName,
                    assignedSong: data.liveAuditionSong
                });
            } catch (err) {
                console.error(err);
                alert("Failed to load audition data");
            } finally {
                setIsLoading(false);
            }
        };

        loadAudition();
    }, [id]);

    const handleSaveScore = async () => {
        setIsSaving(true);
        try {
            const totalScore = Math.round((scores.vocals + scores.performance + scores.spiritual) / 3);

            await saveLiveAuditionScore(id, totalScore);

            alert("Score saved successfully!");
            router.push("/secure-admin/registrations");
        } catch (err) {
            console.error(err);
            alert("Failed to save score");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-gold animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
            {roomData && (
                <div className="flex flex-col md:flex-row w-full h-screen">
                    {/* RTC Stream */}
                    <div className="flex-1">
                        <LiveAuditionRoom
                            {...roomData}
                            isJudge={true}
                            onLeave={() => router.push("/secure-admin/registrations")}
                        />
                    </div>

                    {/* Judge scoring panel */}
                    <div className="w-full md:w-96 bg-zinc-900 border-l border-white/10 p-8 flex flex-col z-[60] shadow-2xl overflow-y-auto">
                        <div className="mb-10">
                            <button
                                onClick={() => router.push("/secure-admin/registrations")}
                                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-6"
                            >
                                <ChevronLeft size={16} /> Back to Dashboard
                            </button>
                            <h2 className="text-2xl font-black text-white">Scoring <span className="text-gold">Panel</span></h2>
                            <p className="text-zinc-500 text-sm mt-1">Rate {contestant.fullName}'s performance.</p>
                        </div>

                        <div className="space-y-10 flex-1">
                            {/* Scoring elements */}
                            {[
                                { key: 'vocals', label: 'Vocals', color: 'text-gold' },
                                { key: 'performance', label: 'Stage Presence', color: 'text-blue-400' },
                                { key: 'spiritual', label: 'Spiritual Impact', color: 'text-purple-400' },
                            ].map((item) => (
                                <div key={item.key} className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold tracking-widest uppercase">
                                        <label className={item.color}>{item.label}</label>
                                        <span className="text-white text-xl">{scores[item.key as keyof typeof scores]}/100</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={scores[item.key as keyof typeof scores]}
                                        onChange={(e) => setScores({ ...scores, [item.key]: parseInt(e.target.value) })}
                                        className="w-full accent-gold h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-zinc-600 font-black">
                                        <span>POOR</span>
                                        <span>AVERAGE</span>
                                        <span>EXCEPTIONAL</span>
                                    </div>
                                </div>
                            ))}

                            <div className="bg-black/50 p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Average Score</span>
                                    <span className="text-3xl font-black text-white">
                                        {Math.round((scores.vocals + scores.performance + scores.spiritual) / 3)}%
                                    </span>
                                </div>
                                <p className="text-zinc-600 text-[10px] leading-relaxed italic">
                                    The average score will be used as the final result for this stage of the competition.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveScore}
                            disabled={isSaving}
                            className="mt-10 w-full py-4 bg-gradient-to-tr from-gold to-gold-light rounded-2xl text-black font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <><Save size={20} /> Complete & Save</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
