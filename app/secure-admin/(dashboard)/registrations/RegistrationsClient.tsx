"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, ChevronRight, PlayCircle, FileText, User, Calendar, MapPin, Mail, Phone, Trophy, Eye, Link as LinkIcon, Music, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { updatePaymentStatus, blockUser, unblockUser, deleteRegistration } from "../../actions";

type Registration = {
    id: string;
    createdAt: string;
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
    category: string;
    description: string;
    whyCompete: string;
    holySpiritRelation: string;
    fiveYearVision: string;
    videoUrl: string;
    receiptUrl: string;
    secondVideoUrl?: string;
    currentStage?: string;
    liveAuditionSong?: string;
    liveAuditionTime?: string;
    liveAuditionRoomId?: string;
    paymentStatus: string;
    status: string;
};

export function RegistrationsClient({ initialData, isContestantsOnly = false }: { initialData: Registration[], isContestantsOnly?: boolean }) {
    const [data] = useState<Registration[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Scheduling state
    const [scheduledSong, setScheduledSong] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    // Toast notification state
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const showToast = useCallback((type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch = item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
            const matchesStatus = statusFilter === "all" || item.paymentStatus === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [data, searchTerm, categoryFilter, statusFilter]);

    const handleAdvanceStage = async (id: string, nextStage: string, extras?: any) => {
        try {
            setIsUpdating(true);
            const res = await fetch("/api/auditions/advance-stage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, nextStage, ...extras }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to advance stage");

            showToast("success", `Advanced to ${nextStage.replace(/_/g, " ")}! Email notification sent to contestant.`);

            // Update local state
            setSelectedUser(prev => prev ? { ...prev, currentStage: nextStage, ...extras } : null);
            setTimeout(() => window.location.reload(), 2500);
        } catch (error: any) {
            console.error("Stage Update Error:", error);
            showToast("error", error.message || "Failed to update stage.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBlockUser = async (id: string, isBlocked: boolean) => {
        try {
            setIsUpdating(true);
            if (isBlocked) {
                await unblockUser(id);
            } else {
                await blockUser(id);
            }
            showToast("success", isBlocked ? "User has been unblocked." : "Contestant has been blocked.");
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error(error);
            showToast("error", "Failed to update block status.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            setIsUpdating(true);
            await deleteRegistration(id);
            setSelectedUser(null);
            setConfirmDelete(false);
            showToast("success", "User has been permanently deleted.");
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error(error);
            showToast("error", "Failed to delete user.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: "verified" | "rejected") => {
        try {
            setIsUpdating(true);
            await updatePaymentStatus(id, newStatus);
            setSelectedUser(prev => prev ? { ...prev, paymentStatus: newStatus, status: newStatus } : null);
            showToast("success", `Payment ${newStatus === "verified" ? "approved" : "rejected"} successfully.`);
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error(error);
            showToast("error", "Failed to update status.");
        } finally {
            setIsUpdating(false);
        }
    };

    const categories = useMemo(() => {
        const cats = new Set(data.map(d => d.category));
        return ["all", ...Array.from(cats)];
    }, [data]);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden selection:bg-gold/30 selection:text-gold-light">
            {/* Background Ambience */}
            <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-gold/5 pt-[10%] to-transparent pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto z-10 relative">
                <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">
                            {isContestantsOnly ? "Approved " : "Registration "}
                            <span className="text-gradient-gold">{isContestantsOnly ? "Contestants" : "Admin"}</span>
                        </h1>
                        <p className="text-gray-400">
                            {isContestantsOnly ? "View all verified audition candidates." : "View and manage audition registration applications."}
                        </p>
                    </div>
                    <div className="flex gap-4 p-4 glass rounded-2xl w-full md:w-auto border border-white/5">
                        <div className="flex flex-col px-4 border-r border-white/10">
                            <span className="text-sm text-gray-400">Total Registered</span>
                            <span className="text-2xl font-bold text-gold-light">{data.length}</span>
                        </div>
                        <div className="flex flex-col px-4">
                            <span className="text-sm text-gray-400">Filtered View</span>
                            <span className="text-2xl font-bold text-white">{filteredData.length}</span>
                        </div>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all appearance-none capitalize cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat} className="bg-black text-white capitalize">
                                    {cat === "all" ? "All Categories" : cat.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all appearance-none capitalize cursor-pointer"
                        >
                            <option value="all" className="bg-black text-white">All Statuses</option>
                            <option value="pending" className="bg-black text-white">Pending</option>
                            <option value="verified" className="bg-black text-white">Verified</option>
                            <option value="rejected" className="bg-black text-white">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-sm text-gray-400 uppercase tracking-wider font-semibold">
                                    <th className="p-5">Applicant</th>
                                    <th className="p-5">Category</th>
                                    <th className="p-5">Payment</th>
                                    <th className="p-5 hidden md:table-cell">Contact</th>
                                    <th className="p-5 hidden lg:table-cell">Date</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No registrations found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={item.id}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); setSelectedUser(item); setConfirmDelete(false); }}
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold to-gold-light flex flex-shrink-0 items-center justify-center text-black font-bold uppercase shadow-[0_0_10px_rgba(223,177,75,0.3)]">
                                                        {item.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-white group-hover:text-gold transition-colors">{item.fullName}</div>
                                                        <div className="text-xs text-gray-500 lg:hidden">{item.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold-light border border-gold/20 capitalize">
                                                    {item.category.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${item.paymentStatus === 'verified' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    item.paymentStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {item.paymentStatus || 'pending'}
                                                </span>
                                                {item.status === 'blocked' && (
                                                    <span className="ml-2 px-2 py-0.5 rounded bg-red-600 text-[10px] font-black uppercase text-white">Blocked</span>
                                                )}
                                            </td>
                                            <td className="p-5 hidden md:table-cell text-sm text-gray-300">
                                                <div>{item.email}</div>
                                                <div className="text-xs text-gray-500 mt-1">{item.phone}</div>
                                            </td>
                                            <td className="p-5 hidden lg:table-cell text-sm text-gray-400">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    className="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-gold hover:text-black transition-all cursor-pointer"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedUser(item); setConfirmDelete(false); }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
                        onClick={() => { setSelectedUser(null); setConfirmDelete(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative custom-scrollbar"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => { setSelectedUser(null); setConfirmDelete(false); }}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-red-400 transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 sm:p-12">
                                {/* Header Profile */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-white/10">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gold to-gold-light flex items-center justify-center text-black font-black text-4xl shadow-[0_0_30px_rgba(223,177,75,0.4)]">
                                        {selectedUser.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{selectedUser.fullName}</h2>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gold/10 text-gold-light border border-gold/20 capitalize">
                                                <Trophy className="w-4 h-4" />
                                                {selectedUser.category.replace('_', ' ')}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border capitalize ${selectedUser.paymentStatus === 'verified' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                selectedUser.paymentStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                Payment: {selectedUser.paymentStatus || 'pending'}
                                            </span>
                                            {selectedUser.status === 'blocked' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-red-500 text-white font-bold">
                                                    BLOCKED
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-white/5 text-gray-300 border border-white/10">
                                                <Calendar className="w-4 h-4 opacity-70" />
                                                Applied: {new Date(selectedUser.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-10">

                                    {/* Left Column: Details */}
                                    <div className="lg:col-span-1 space-y-8">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-gold" /> Personal Details</h3>
                                            <ul className="space-y-4">
                                                <li className="flex items-start gap-4">
                                                    <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Email Address</p>
                                                        <p className="text-sm font-medium text-gray-200">{selectedUser.email}</p>
                                                    </div>
                                                </li>
                                                <li className="flex items-start gap-4">
                                                    <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Phone</p>
                                                        <p className="text-sm font-medium text-gray-200">{selectedUser.phone}</p>
                                                    </div>
                                                </li>
                                                <li className="flex items-start gap-4">
                                                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Date of Birth</p>
                                                        <p className="text-sm font-medium text-gray-200">{selectedUser.dob}</p>
                                                    </div>
                                                </li>
                                                <li className="flex items-start gap-4">
                                                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Address</p>
                                                        <p className="text-sm font-medium text-gray-200">{selectedUser.address}</p>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-gold" /> Uploaded Files</h3>
                                            <div className="space-y-3">
                                                {selectedUser.videoUrl && (
                                                    <a href={selectedUser.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-gold/10 hover:border-gold/30 hover:text-gold-light transition-all group">
                                                        <span className="flex items-center gap-3 text-sm font-medium"><PlayCircle className="w-5 h-5 text-gold group-hover:text-gold-light" /> Audition Video</span>
                                                        <ChevronRight className="w-4 h-4 opacity-50" />
                                                    </a>
                                                )}
                                                {selectedUser.receiptUrl && (
                                                    <a href={selectedUser.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-gold/10 hover:border-gold/30 hover:text-gold-light transition-all group">
                                                        <span className="flex items-center gap-3 text-sm font-medium"><FileText className="w-5 h-5 text-gold group-hover:text-gold-light" /> Payment Receipt</span>
                                                        <ChevronRight className="w-4 h-4 opacity-50" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Q&A */}
                                    <div className="lg:col-span-2 space-y-8 lg:border-l lg:border-white/10 lg:pl-10">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gold tracking-widest uppercase mb-2">About Candidate</h3>
                                            <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">{selectedUser.description}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gold tracking-widest uppercase mb-2">Why Compete?</h3>
                                            <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">{selectedUser.whyCompete}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gold tracking-widest uppercase mb-2">Relationship with Holy Spirit</h3>
                                            <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">{selectedUser.holySpiritRelation}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gold tracking-widest uppercase mb-2">5-Year Vision</h3>
                                            <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">{selectedUser.fiveYearVision}</p>
                                        </div>

                                        {/* Audition Stage Management */}
                                        <div className="pt-8 mt-8 border-t border-white/10">
                                            <h3 className="text-sm font-semibold text-gold tracking-widest uppercase mb-4">Audition Management</h3>

                                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Current Stage</p>
                                                        <p className="text-lg font-bold text-white capitalize">{selectedUser.currentStage?.replace(/_/g, ' ') || 'Registration'}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedUser.currentStage === 'live_audition_scheduled' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                        selectedUser.currentStage === 'second_video_pending' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                            'bg-zinc-800 text-zinc-400 border border-white/5'
                                                        }`}>
                                                        Stage {selectedUser.currentStage === 'live_audition_scheduled' ? '3' : selectedUser.currentStage === 'second_video_pending' ? '2' : '1'}
                                                    </span>
                                                </div>

                                                {selectedUser.secondVideoUrl && (
                                                    <a href={selectedUser.secondVideoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-gold/5 border border-gold/20 hover:bg-gold/10 transition-all group">
                                                        <span className="flex items-center gap-3 text-sm font-bold text-gold-light"><Music className="w-5 h-5" /> View Second Video (Instrumentals)</span>
                                                        <ChevronRight className="w-4 h-4 opacity-50" />
                                                    </a>
                                                )}

                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    {(selectedUser.currentStage === 'registration' || !selectedUser.currentStage) && selectedUser.paymentStatus === 'verified' && (
                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={() => handleAdvanceStage(selectedUser.id, 'second_video_pending')}
                                                            className="w-full py-3 px-4 rounded-xl font-bold bg-gold text-black hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                                        >
                                                            Promote to Second Video <ChevronRight size={18} />
                                                        </button>
                                                    )}

                                                    {selectedUser.currentStage === 'second_video_pending' && (
                                                        <div className="space-y-4 p-4 bg-black/40 rounded-xl border border-white/5">
                                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Schedule Live Audition</p>
                                                            <input
                                                                type="text"
                                                                placeholder="Assign Song Name"
                                                                value={scheduledSong}
                                                                onChange={(e) => setScheduledSong(e.target.value)}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-gold"
                                                            />
                                                            <input
                                                                type="datetime-local"
                                                                value={scheduledTime}
                                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-gold"
                                                                style={{ colorScheme: 'dark' }}
                                                            />
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => {
                                                                    if (!scheduledSong || !scheduledTime) {
                                                                        showToast("error", "Please assign a song and a scheduled time.");
                                                                        return;
                                                                    }
                                                                    handleAdvanceStage(selectedUser.id, 'live_audition_scheduled', {
                                                                        song: scheduledSong,
                                                                        scheduledTime: scheduledTime,
                                                                        roomId: `room_${selectedUser.id}`
                                                                    });
                                                                }}
                                                                className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-tr from-purple-600 to-blue-600 text-white hover:scale-[1.02] transition-transform"
                                                            >
                                                                Schedule Live Audition
                                                            </button>
                                                        </div>
                                                    )}

                                                    {selectedUser.currentStage === 'live_audition_scheduled' && (
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-zinc-900 rounded-xl">
                                                                <p className="text-xs text-zinc-500">Scheduled for:</p>
                                                                <p className="font-bold">{new Date(selectedUser.liveAuditionTime!).toLocaleString()}</p>
                                                                <p className="text-xs text-zinc-500 mt-2">Assigned Song:</p>
                                                                <p className="font-bold text-gold-light">{selectedUser.liveAuditionSong}</p>
                                                            </div>
                                                            <Link
                                                                href={`/secure-admin/live-auditions/${selectedUser.id}`}
                                                                className="w-full py-3 px-4 rounded-xl font-bold bg-green-600 text-white hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                Join Live Room <PlayCircle size={18} />
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Admin Actions */}
                                        {!isContestantsOnly && (
                                            <div className="pt-8 mt-8 border-t border-white/10">
                                                <h3 className="text-sm font-semibold text-red-400 tracking-widest uppercase mb-4">Payment Verification</h3>
                                                <div className="flex gap-4">
                                                    <button
                                                        disabled={isUpdating || selectedUser.paymentStatus === 'verified'}
                                                        onClick={() => handleUpdateStatus(selectedUser.id, 'verified')}
                                                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-green-500/20 border border-green-500/50 hover:bg-green-500 hover:text-black text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Approve Payment
                                                    </button>
                                                    <button
                                                        disabled={isUpdating || selectedUser.paymentStatus === 'rejected'}
                                                        onClick={() => handleUpdateStatus(selectedUser.id, 'rejected')}
                                                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 hover:border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Reject Payment
                                                    </button>
                                                </div>

                                                <div className="mt-4 space-y-3">
                                                    <button
                                                        disabled={isUpdating}
                                                        onClick={() => handleBlockUser(selectedUser.id, selectedUser.status === 'blocked')}
                                                        className={`w-full py-3 px-4 rounded-xl font-bold border transition-colors ${selectedUser.status === 'blocked'
                                                            ? 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                                            : 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-black'
                                                            }`}
                                                    >
                                                        {selectedUser.status === 'blocked' ? 'Unblock User' : 'Block Contestant'}
                                                    </button>

                                                    {/* Delete User */}
                                                    {!confirmDelete ? (
                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={() => setConfirmDelete(true)}
                                                            className="w-full py-3 px-4 rounded-xl font-bold border border-red-900/60 bg-red-950/30 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete User Permanently
                                                        </button>
                                                    ) : (
                                                        <div className="p-4 rounded-xl border border-red-600/60 bg-red-950/40 space-y-3">
                                                            <p className="text-sm font-bold text-red-400 text-center">⚠️ This cannot be undone. Delete <span className="text-white">{selectedUser.fullName}</span>?</p>
                                                            <div className="flex gap-3">
                                                                <button
                                                                    disabled={isUpdating}
                                                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                                                    className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 transition-colors"
                                                                >
                                                                    {isUpdating ? 'Deleting...' : 'Yes, Delete'}
                                                                </button>
                                                                <button
                                                                    disabled={isUpdating}
                                                                    onClick={() => setConfirmDelete(false)}
                                                                    className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm"
                        style={{
                            background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                            borderColor: toast.type === "success" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)",
                        }}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                        <p className={`text-sm font-medium ${toast.type === "success" ? "text-green-300" : "text-red-300"}`}>
                            {toast.message}
                        </p>
                        <button onClick={() => setToast(null)} className="ml-2 text-white/40 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
