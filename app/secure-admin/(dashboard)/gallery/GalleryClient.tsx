"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Star, Trash2, Image as ImageIcon, Film, Plus, Loader2, Play, CheckCircle2, ChevronRight, LayoutGrid } from "lucide-react";
import { addGalleryItem, toggleGalleryFeatured, deleteGalleryItem } from "../../actions";

type GalleryItem = {
    id: string;
    createdAt: string | Date;
    type: "image" | "video";
    url: string;
    caption: string | null;
    isFeatured: boolean | null;
};

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong.";

export function GalleryClient({ initialData }: { initialData: GalleryItem[] }) {
    const [data, setData] = useState<GalleryItem[]>(initialData);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadFile(file);

            // Create preview URL
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return;

        try {
            setIsUploading(true);
            setUploadSuccess(false);

            const fileExt = uploadFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const type = uploadFile.type.startsWith('video/') ? 'video' : 'image';

            // Get presigned URL
            const resUrl = await fetch("/api/upload/url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: fileName, contentType: uploadFile.type })
            });
            const urlData = await resUrl.json();
            if (!resUrl.ok) throw new Error(urlData.error || "Failed to get upload URL");

            // Upload directly to R2
            const uploadRes = await fetch(urlData.signedUrl, {
                method: "PUT",
                headers: { "Content-Type": uploadFile.type },
                body: uploadFile
            });
            if (!uploadRes.ok) throw new Error("Upload to cloud failed");

            const publicUrl = urlData.publicUrl || fileName;

            // Save to database via Server Action
            const newItem = await addGalleryItem(publicUrl, type, caption);

            // Fetch the newly added item to sync state
            if (newItem) {
                setData(prev => [newItem as GalleryItem, ...prev]);
            }

            setUploadSuccess(true);
            setTimeout(() => {
                setShowUploadModal(false);
                setUploadFile(null);
                setPreviewUrl(null);
                setCaption("");
                setUploadSuccess(false);
            }, 1000);

        } catch (error: unknown) {
            console.error(error);
            alert("Upload failed: " + getErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            setData(prev => prev.map(item => item.id === id ? { ...item, isFeatured: !currentStatus } : item));
            await toggleGalleryFeatured(id, !currentStatus);
        } catch {
            alert("Failed to update");
            setData(prev => prev.map(item => item.id === id ? { ...item, isFeatured: currentStatus } : item));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this media item? This action will also remove the file from storage.")) return;
        try {
            setData(prev => prev.filter(item => item.id !== id));
            await deleteGalleryItem(id);
        } catch {
            alert("Failed to delete");
            window.location.reload();
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8 bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-3 text-gold text-xs font-black uppercase tracking-[0.3em] mb-4">
                        <LayoutGrid className="w-4 h-4" />
                        Media Assets
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-4">Gallery <span className="text-gradient-gold">Studio</span></h1>
                    <p className="text-gray-400 text-lg font-light">Curate and manage the visual journey of the Gospel Icon.</p>
                </div>
                <button
                    onClick={() => {
                        setShowUploadModal(true);
                        setUploadSuccess(false);
                    }}
                    className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-gradient-to-tr from-gold to-gold-light text-black hover:scale-105 transition-all shadow-[0_0_30px_rgba(223,177,75,0.3)] hover:shadow-gold/40"
                >
                    <Plus className="w-5 h-5" />
                    Add New Media
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <AnimatePresence mode="popLayout">
                    {data.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-40 text-center glass rounded-[3rem] border border-white/5 flex flex-col items-center"
                        >
                            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                                <ImageIcon className="w-10 h-10 text-gray-500 opacity-30" />
                            </div>
                            <p className="text-2xl font-black text-gray-400">Your studio is empty.</p>
                            <p className="text-gray-500 mt-2 font-medium max-w-xs transition-colors hover:text-gold cursor-pointer" onClick={() => setShowUploadModal(true)}>Upload your first masterpiece to begin.</p>
                        </motion.div>
                    ) : (
                        data.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative glass rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-gold/40 transition-all duration-500 shadow-2xl hover:shadow-gold/10"
                            >
                                {/* Media Container */}
                                <div className="aspect-[4/3] relative bg-black w-full overflow-hidden">
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full relative group/video">
                                            <video src={item.url} className="w-full h-full object-cover opacity-80" muted playsInline />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform">
                                                    <Play className="w-6 h-6 fill-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.url}
                                                alt={item.caption || "Gallery item"}
                                                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                            />
                                        </>
                                    )}

                                    {/* Overlay Badges */}
                                    <div className="absolute top-6 left-6 flex gap-3">
                                        <span className="p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white shadow-xl">
                                            {item.type === 'video' ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                        </span>
                                        {item.isFeatured && (
                                            <span className="p-3 rounded-2xl bg-gold text-black shadow-gold/30 shadow-lg">
                                                <Star className="w-4 h-4 fill-black" />
                                            </span>
                                        )}
                                    </div>

                                    {/* Delete Button (Overlay) */}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="absolute top-6 right-6 p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-black transition-all shadow-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Meta details */}
                                <div className="p-8">
                                    <p className="text-gray-300 font-medium text-sm line-clamp-2 h-10 mb-8 leading-relaxed italic group-hover:text-white transition-colors">
                                        {item.caption || "A moment worth remembering."}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => handleToggleFeatured(item.id, item.isFeatured ?? false)}
                                            className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl transition-all border ${item.isFeatured
                                                ? "bg-gold text-black border-gold shadow-lg shadow-gold/20"
                                                : "bg-white/5 text-gray-400 border-white/10 hover:border-gold/40 hover:text-white"
                                                }`}
                                        >
                                            <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-black' : ''}`} />
                                            {item.isFeatured ? "Featured" : "Feature"}
                                        </button>

                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="w-full max-w-4xl glass p-10 md:p-14 rounded-[3.5rem] border border-white/10 relative shadow-[0_0_80px_rgba(0,0,0,0.8)]"
                        >
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setUploadFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="absolute top-10 right-10 p-4 rounded-2xl bg-white/5 hover:bg-white/10 hover:text-red-400 transition-all border border-white/10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-4xl font-black mb-10 tracking-tighter">Publish <span className="text-gradient-gold">Media</span></h2>

                            <form onSubmit={handleUploadSubmit} className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-12">
                                    {/* Dropzone */}
                                    <div className="relative group">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Master Asset</label>
                                        <div className={`relative aspect-square border-2 border-dashed rounded-[2.5rem] overflow-hidden transition-all duration-500 ${previewUrl ? 'border-gold/50 shadow-2xl shadow-gold/10' : 'border-white/10 hover:border-gold/30 hover:bg-white/[0.02]'
                                            }`}>
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                onChange={handleFileChange}
                                                required={!uploadFile}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            {previewUrl ? (
                                                <div className="w-full h-full relative">
                                                    {uploadFile?.type.startsWith('video/') ? (
                                                        <video src={previewUrl} className="w-full h-full object-cover" muted />
                                                    ) : (
                                                        <Image src={previewUrl} alt="Selected upload preview" fill unoptimized className="object-cover" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-xs font-black text-white bg-gold/90 px-8 py-3 rounded-2xl text-black border border-white/20 shadow-2xl">Change Master Asset</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold/10 transition-all border border-white/5">
                                                        <Upload className="w-8 h-8 text-zinc-500 group-hover:text-gold" />
                                                    </div>
                                                    <p className="text-lg font-black text-zinc-400">Deploy Media</p>
                                                    <p className="text-[10px] text-zinc-600 mt-2 font-black uppercase tracking-widest">Image or Video File</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Data Fields */}
                                    <div className="flex flex-col gap-8">
                                        <div className="flex-1">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Captivating Narrative</label>
                                            <textarea
                                                value={caption}
                                                onChange={(e) => setCaption(e.target.value)}
                                                rows={6}
                                                className="w-full p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 focus:border-gold outline-none transition-all resize-none text-base leading-relaxed font-light placeholder:text-zinc-700"
                                                placeholder="Craft a message for this media..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!uploadFile || isUploading || uploadSuccess}
                                            className={`group w-full flex items-center justify-center gap-4 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all ${uploadSuccess
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gradient-to-tr from-gold to-gold-light text-black hover:scale-[1.02] shadow-2xl shadow-gold/20 disabled:opacity-50'
                                                }`}
                                        >
                                            {isUploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : uploadSuccess ? (
                                                <><CheckCircle2 className="w-6 h-6" /> Deployed</>
                                            ) : (
                                                <>
                                                    Commit to Production
                                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
