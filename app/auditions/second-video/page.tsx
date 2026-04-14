"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle, ChevronLeft, Music, ArrowRight, User } from "lucide-react";
import Link from "next/link";

export default function SecondVideoSubmission() {
    const [email, setEmail] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [userName, setUserName] = useState("");
    const [video, setVideo] = useState<File | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleEligibilityCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return setErrorMsg("Please enter your email.");

        setIsChecking(true);
        setErrorMsg("");

        try {
            const res = await fetch(`/api/auditions/check-eligibility?email=${encodeURIComponent(email)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Eligibility check failed");
            }

            setUserName(data.user.fullName);
            setIsVerified(true);
            setErrorMsg("");
        } catch (err: any) {
            setErrorMsg(err.message);
            setIsVerified(false);
        } finally {
            setIsChecking(false);
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !video || !isVerified) {
            setErrorMsg("Please provide your email and upload the second video.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const timestamp = Date.now();
            const safeName = email.split('@')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const videoExt = video.name.split('.').pop();
            const videoPath = `second_stage/${safeName}_${timestamp}_v2.${videoExt}`;

            // Get Presigned URL
            const resUrl = await fetch("/api/upload/url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: videoPath, contentType: video.type })
            });
            const urlData = await resUrl.json();
            if (!resUrl.ok) throw new Error(urlData.error || "Failed to get upload URL");

            // Upload Video directly to R2
            const uploadRes = await fetch(urlData.signedUrl, {
                method: "PUT",
                headers: { "Content-Type": video.type },
                body: video
            });
            if (!uploadRes.ok) throw new Error("Video Upload Failed");

            const secondVideoUrl = urlData.publicUrl || videoPath;

            // Update Database via API
            const res = await fetch("/api/auditions/second-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, secondVideoUrl }),
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || "Submission failed");
            }

            setIsSuccess(true);
        } catch (err: any) {
            setErrorMsg(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass p-10 rounded-3xl text-center border border-white/10"
                >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Submission Successful!</h2>
                    <p className="text-gray-400 mb-8">
                        Your second audition video (with instrumentals) has been received. Our judges will review it soon.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex w-full justify-center px-6 py-3 text-sm font-semibold text-black bg-gradient-to-tr from-gold to-gold-light rounded-full hover:scale-105 transition-transform"
                    >
                        Return Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-gold/30 py-20 px-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-gold/5 pt-[10%] to-transparent pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <Link href="/" className="text-gold hover:text-gold-light text-sm font-medium mb-6 inline-flex items-center transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Second Audition <span className="text-gradient-gold">Video</span>
                    </h1>
                    <p className="text-gray-400">Upload your second audition video featuring your performance with musical accompaniment.</p>
                </div>

                <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">

                    {!isVerified ? (
                        <form onSubmit={handleEligibilityCheck} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-4 text-center">Enter your registered email address to verify your payment status and eligibility for the next stage.</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-center"
                                    placeholder="your-email@example.com"
                                    required
                                />
                            </div>

                            {errorMsg && (
                                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                                    {errorMsg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isChecking}
                                className="w-full flex items-center px-8 py-4 rounded-full text-lg font-bold text-black bg-gradient-to-tr from-gold to-gold-light justify-center hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isChecking ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
                                    />
                                ) : (
                                    <>Verify Eligibility <ArrowRight className="ml-2 w-5 h-5" /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleUpload} className="space-y-8">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-green-400 uppercase tracking-widest font-black mb-1">Eligible Applicant</span>
                                    <span className="text-white font-bold flex items-center gap-2"><User size={16} /> {userName}</span>
                                </div>
                                <CheckCircle className="text-green-500 w-8 h-8" />
                            </motion.div>

                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Audition Video (With Instrumentals)</label>
                                <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${video ? 'border-gold bg-gold/5' : 'border-white/20 hover:border-white/50 bg-black/50'}`}>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setVideo(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="pointer-events-none flex flex-col items-center">
                                        {video ? (
                                            <>
                                                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                                                    <Music className="w-8 h-8 text-gold" />
                                                </div>
                                                <span className="text-lg font-medium text-gold-light truncate max-w-[250px]">{video.name}</span>
                                                <span className="text-xs text-gray-500 mt-2">Click to change video</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-gray-500 mb-4 group-hover:text-gold transition-colors" />
                                                <span className="text-lg font-medium text-gray-300">Upload Video File</span>
                                                <p className="text-sm text-gray-500 mt-2">MP4, MOV preferred. Performance with musical backing.</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                                    {errorMsg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center px-8 py-4 rounded-full text-lg font-bold text-black bg-gradient-to-tr from-gold to-gold-light justify-center hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100 shadow-[0_4px_20px_rgba(223,177,75,0.3)]"
                            >
                                {isSubmitting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
                                    />
                                ) : (
                                    "Submit Second Video"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
