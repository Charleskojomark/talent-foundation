"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, Megaphone, Calendar, Trophy, Send } from "lucide-react";
import { addAnnouncement, deleteAnnouncement } from "../../actions";

type Announcement = {
    id: string;
    created_at: string;
    title: string;
    content: string;
    type: "update" | "event" | "result";
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case "event": return <Calendar className="w-5 h-5 text-blue-400" />;
        case "result": return <Trophy className="w-5 h-5 text-gold-light" />;
        default: return <Megaphone className="w-5 h-5 text-green-400" />;
    }
};

const getTypeStyle = (type: string) => {
    switch (type) {
        case "event": return "bg-blue-500/10 border-blue-500/20 text-blue-400";
        case "result": return "bg-gold/10 border-gold/20 text-gold-light";
        default: return "bg-green-500/10 border-green-500/20 text-green-400";
    }
};

export function AnnouncementsClient({ initialData }: { initialData: Announcement[] }) {
    const [data, setData] = useState<Announcement[]>(initialData);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState<"update" | "event" | "result">("update");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;

        try {
            setIsSubmitting(true);
            await addAnnouncement(title, content, type);
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            alert("Failed to post announcement: " + error.message);
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            setData(prev => prev.filter(item => item.id !== id));
            await deleteAnnouncement(id);
        } catch {
            alert("Failed to delete");
            window.location.reload();
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto selection:bg-gold/30 selection:text-gold-light">
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Announcements</h1>
                    <p className="text-gray-400">Post updates, events, and results to the public site.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-gradient-to-tr from-gold to-gold-light text-black hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> New Post
                </button>
            </header>

            {/* List */}
            <div className="space-y-6">
                <AnimatePresence>
                    {data.length === 0 ? (
                        <div className="py-20 text-center text-gray-500 glass rounded-3xl border border-white/5">
                            No announcements posted yet.
                        </div>
                    ) : (
                        data.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-3xl border border-white/10 p-6 md:p-8 relative overflow-hidden group"
                            >
                                {/* Background Accent */}
                                <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-bl blur-3xl opacity-10 rounded-full pointer-events-none ${item.type === 'event' ? 'from-blue-500' : item.type === 'result' ? 'from-gold' : 'from-green-500'
                                    }`} />

                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border ${getTypeStyle(item.type)}`}>
                                        {getTypeIcon(item.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getTypeStyle(item.type)}`}>
                                                {item.type}
                                            </span>
                                            <span className="text-sm text-gray-500 font-medium">
                                                {new Date(item.created_at).toLocaleDateString(undefined, {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-3">{item.title}</h2>
                                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-start md:justify-end">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/10 relative"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-red-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-tr from-gold to-gold-light rounded-2xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(223,177,75,0.4)]">
                                    <Send className="w-6 h-6 ml-1" />
                                </div>
                                <h2 className="text-2xl font-bold">Compose Post</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Post Type</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {(["update", "event", "result"] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all border ${type === t
                                                        ? getTypeStyle(t)
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-white font-medium"
                                        placeholder="E.g. Audition Phase 2 Results"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Content</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                        rows={6}
                                        className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all resize-none text-white leading-relaxed"
                                        placeholder="Write your announcement here..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !title || !content}
                                        className="px-8 py-4 rounded-xl font-bold bg-gradient-to-tr from-gold to-gold-light text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                    >
                                        {isSubmitting ? "Posting..." : "Publish Announcement"}
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
