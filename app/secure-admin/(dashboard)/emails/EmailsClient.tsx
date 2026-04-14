"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Mail, CheckCircle, Search, Users, Ticket, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmailData {
    name: string;
    email: string;
    source: string;
}

export default function EmailsClient({ initialData }: { initialData: EmailData[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSource, setFilterSource] = useState<"All" | "Contestant" | "Ticket Buyer">("All");
    const [copied, setCopied] = useState(false);

    const filteredData = useMemo(() => {
        return initialData.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterSource === "All" || item.source === filterSource;
            return matchesSearch && matchesFilter;
        });
    }, [initialData, searchTerm, filterSource]);

    const handleCopyAll = async () => {
        const emailList = filteredData.map(item => item.email).join(", ");
        try {
            await navigator.clipboard.writeText(emailList);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Mail className="text-gold" />
                        Email Hub
                    </h1>
                    <p className="text-zinc-500 mt-1">Manage and export participant contact information.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full md:w-auto gap-4">
                    <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-2 bg-zinc-900 border border-white/10 rounded-xl p-1">
                        {["All", "Contestant", "Ticket Buyer"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterSource(type as any)}
                                className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all w-full text-center whitespace-nowrap ${filterSource === type
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleCopyAll}
                        disabled={filteredData.length === 0}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-gold text-black hover:bg-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? "Copied!" : "Copy All Visible"}
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-gold transition-colors"
                />
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-black/20">
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Name</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Source</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-zinc-500">
                                        No emails found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, idx) => (
                                    <tr key={`${item.email}-${idx}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 font-bold text-white">{item.name}</td>
                                        <td className="p-4 text-zinc-400">{item.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${item.source === "Contestant"
                                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                }`}>
                                                {item.source === "Contestant" ? <Users size={12} /> : <Ticket size={12} />}
                                                {item.source}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.email);
                                                }}
                                                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                                title="Copy single email"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm text-zinc-500 px-2">
                <span>Showing {filteredData.length} emails</span>
                <span>Sorted alphabetically</span>
            </div>
        </div>
    );
}
