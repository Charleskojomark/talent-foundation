"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Search, Mail, Phone, Ticket, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type TicketData = {
    id: string;
    createdAt: string;
    fullName: string;
    email: string;
    phone: string;
    ticketType: string;
    receiptUrl: string;
    paymentStatus: string;
};

export default function TicketsClient({ initialData }: { initialData: TicketData[] }) {
    const [tickets, setTickets] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const filteredTickets = tickets.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const executeVerify = async () => {
        if (!verifyingId) return;

        const id = verifyingId;
        setLoadingIds(prev => new Set(prev).add(id));
        setVerifyingId(null);

        try {
            const res = await fetch("/api/secure-admin/tickets/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) throw new Error("Failed to verify ticket");

            setTickets(prev => prev.map(t => t.id === id ? { ...t, paymentStatus: "verified" } : t));
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setLoadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Audience Tickets ({tickets.length})</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map(ticket => (
                    <div key={ticket.id} className="glass p-6 rounded-2xl border border-white/10 flex flex-col relative overflow-hidden group">
                        {ticket.paymentStatus === "verified" && (
                            <div className="absolute top-0 right-0 bg-green-500/20 text-green-500 text-xs font-bold px-3 py-1 rounded-bl-lg">
                                VERIFIED
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center \${ticket.paymentStatus === "verified" ? "bg-green-500/10 text-green-500" : "bg-gold/10 text-gold"}`}>
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{ticket.fullName}</h3>
                                <div className="text-xs text-gray-400 font-mono">{ticket.ticketType} PASS</div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center text-sm text-gray-300">
                                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="truncate">{ticket.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-300">
                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                {ticket.phone}
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5">
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Payment Receipt</h4>
                            <a href={ticket.receiptUrl} target="_blank" rel="noopener noreferrer" className="block relative h-24 w-full rounded-lg overflow-hidden border border-white/10 hover:border-gold transition-colors mb-4 group-hover:shadow-[0_0_15px_rgba(223,177,75,0.2)]">
                                <Image
                                    src={ticket.receiptUrl}
                                    alt="Receipt"
                                    fill
                                    className="object-cover"
                                />
                            </a>

                            {ticket.paymentStatus !== "verified" && (
                                <button
                                    onClick={() => setVerifyingId(ticket.id)}
                                    disabled={loadingIds.has(ticket.id)}
                                    className="w-full flex items-center justify-center py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors font-medium text-sm border border-green-500/30 disabled:opacity-50"
                                >
                                    {loadingIds.has(ticket.id) ? (
                                        <span className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <><CheckCircle className="w-4 h-4 mr-2" /> Approve & Issue Ticket</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredTickets.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No tickets found.
                    </div>
                )}
            </div>

            <AnimatePresence>
                {verifyingId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
                        >
                            <button
                                onClick={() => setVerifyingId(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-8 h-8 text-gold" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">Verify Payment?</h3>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    Are you sure you want to verify this ticket payment? The official digital ticket will be sent to the buyer immediately.
                                </p>

                                <div className="flex w-full gap-4">
                                    <button
                                        onClick={() => setVerifyingId(null)}
                                        className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={executeVerify}
                                        className="flex-1 py-3 px-4 rounded-xl bg-gold text-black font-bold hover:bg-gold-light transition-colors shadow-[0_0_15px_rgba(223,177,75,0.4)]"
                                    >
                                        Yes, Verify
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
