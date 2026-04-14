"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, User, Globe, Link as LinkIcon, Upload } from "lucide-react";
import { addJudge, deleteJudge } from "../../actions";

type Judge = {
    id: string;
    created_at: string;
    full_name: string;
    bio: string;
    photo_url: string;
    social_links: {
        instagram?: string;
        twitter?: string;
        website?: string;
    } | null;
};

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong.";

export function JudgesClient({ initialData }: { initialData: Judge[] }) {
    const [data, setData] = useState<Judge[]>(initialData);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [socials, setSocials] = useState({
        instagram: "",
        twitter: "",
        website: ""
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !bio || !photo) return;

        try {
            setIsSubmitting(true);

            const fileExt = photo.name.split('.').pop();
            const fileName = `judge_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Get presigned URL
            const resUrl = await fetch("/api/upload/url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: fileName, contentType: photo.type, bucketName: 'talent-foundation' })
                // Note: bucket depends on your R2 setup, using default in API
            });
            const urlData = await resUrl.json();
            if (!resUrl.ok) throw new Error(urlData.error || "Failed to get upload URL");

            // Upload directly to R2
            const uploadRes = await fetch(urlData.signedUrl, {
                method: "PUT",
                headers: { "Content-Type": photo.type },
                body: photo
            });
            if (!uploadRes.ok) throw new Error("Upload to cloud failed");

            const publicUrl = urlData.publicUrl || fileName;

            await addJudge(fullName, bio, publicUrl, socials);
            window.location.reload();
        } catch (error: unknown) {
            console.error(error);
            alert("Failed to add judge: " + getErrorMessage(error));
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this judge?")) return;
        try {
            setData(prev => prev.filter(item => item.id !== id));
            await deleteJudge(id);
        } catch {
            alert("Failed to delete");
            window.location.reload();
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto selection:bg-gold/30 selection:text-gold-light">
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Panel of <span className="text-gradient-gold">Judges</span></h1>
                    <p className="text-gray-400">Manage the esteemed judges for the talent auditions.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-gradient-to-tr from-gold to-gold-light text-black hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> Add Judge
                </button>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {data.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-500 glass rounded-3xl border border-white/5">
                            No judges added yet.
                        </div>
                    ) : (
                        data.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative glass rounded-3xl border border-white/10 overflow-hidden"
                            >
                                {/* Photo Top */}
                                <div className="h-64 relative bg-black/50 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] to-transparent z-10" />
                                    <Image src={item.photo_url} alt={item.full_name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-700" />

                                    <div className="absolute bottom-4 left-4 z-20">
                                        <h3 className="text-2xl font-bold text-white mb-1">{item.full_name}</h3>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur-md rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Info Bottom */}
                                <div className="p-6 relative">
                                    <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-3">
                                        {item.bio}
                                    </p>

                                    {item.social_links && (Object.values(item.social_links).some(Boolean)) && (
                                        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                            {item.social_links.instagram && (
                                                <a href={item.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors">
                                                    <span className="text-xs font-bold font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">IG</span>
                                                </a>
                                            )}
                                            {item.social_links.twitter && (
                                                <a href={item.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors text-xs font-bold font-mono tracking-widest uppercase">
                                                    X
                                                </a>
                                            )}
                                            {item.social_links.website && (
                                                <a href={item.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                                    <Globe className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Compose Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/10 relative my-8"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-red-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-tr from-gold to-gold-light rounded-2xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(223,177,75,0.4)]">
                                    <User className="w-6 h-6 ml-1" />
                                </div>
                                <h2 className="text-2xl font-bold">Add Judge</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-white font-medium"
                                        placeholder="E.g. Simon Cowell"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Biography / Description</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all resize-none text-white leading-relaxed"
                                        placeholder="Short bio about their experience..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Profile Photo</label>
                                    <div className="relative border-2 border-dashed border-white/20 hover:border-gold/50 rounded-2xl p-6 text-center bg-black/50 transition-colors group cursor-pointer flex items-center justify-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            required
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center pointer-events-none gap-2">
                                            <Upload className={`w-6 h-6 transition-colors ${photo ? 'text-gold' : 'text-gray-500 group-hover:text-gold-light'}`} />
                                            <span className={`text-sm font-medium ${photo ? 'text-gold-light' : 'text-gray-400'}`}>
                                                {photo ? photo.name : "Click or drag image here"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
                                        <LinkIcon className="w-4 h-4" /> Social Links (Optional)
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="url" name="instagram" placeholder="Instagram URL" value={socials.instagram} onChange={handleSocialChange}
                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="url" name="twitter" placeholder="X (Twitter) URL" value={socials.twitter} onChange={handleSocialChange}
                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="url" name="website" placeholder="Website URL" value={socials.website} onChange={handleSocialChange}
                                            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 outline-none transition-all text-sm md:col-span-2"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !fullName || !bio || !photo}
                                        className="px-8 py-4 rounded-xl font-bold bg-gradient-to-tr from-gold to-gold-light text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[200px]"
                                    >
                                        {isSubmitting ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                                        ) : (
                                            "Save Judge"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
