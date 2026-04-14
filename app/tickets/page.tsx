"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Ticket, Upload, CheckCircle, CreditCard } from "lucide-react";
import Link from "next/link";

export default function TicketPurchase() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        ticketType: "Regular",
    });
    const [receipt, setReceipt] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const ticketOptions = [
        { id: "Regular", name: "Regular Admission", price: "₦1,000", desc: "Standard seating and entry." },
        { id: "VIP", name: "VIP Pass", price: "₦5,000", desc: "Front-row seating, dedicated entrance, and refreshments." }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receipt) {
            setErrorMsg("Please upload your payment receipt.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const timestamp = Date.now();
            const safeName = formData.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const ext = receipt.name.split('.').pop();
            const receiptPath = `tickets/${safeName}_${timestamp}.${ext}`;

            // 1. Get Presigned URL for Upload
            const resUrl = await fetch("/api/upload/url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: receiptPath, contentType: receipt.type })
            });
            const urlData = await resUrl.json();
            if (!resUrl.ok) throw new Error(urlData.error || "Failed to get upload URL");

            // 2. Upload Receipt directly to R2
            const uploadRes = await fetch(urlData.signedUrl, {
                method: "PUT",
                headers: { "Content-Type": receipt.type },
                body: receipt
            });
            if (!uploadRes.ok) throw new Error("Receipt Upload Failed");

            const receiptUrl = urlData.publicUrl || receiptPath;

            // 3. Save Ticket to Database
            const apiRes = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    receiptUrl,
                }),
            });

            if (!apiRes.ok) {
                const result = await apiRes.json();
                throw new Error(result.error || "Failed to process ticket request.");
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
                    <h2 className="text-3xl font-bold mb-4">Request Submitted!</h2>
                    <p className="text-gray-400 mb-8">
                        Your payment receipt has been successfully uploaded to the system. Once our team verifies the transfer, your digital ticket will be sent instantly to <strong>{formData.email}</strong>.
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

            <div className="max-w-4xl mx-auto relative z-10 grid md:grid-cols-5 gap-12">
                <div className="md:col-span-2">
                    <Link href="/" className="text-gold hover:text-gold-light text-sm font-medium mb-6 inline-flex items-center transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 mt-6">
                        Buy <span className="text-gradient-gold">Tickets</span>
                    </h1>
                    <p className="text-gray-400 mb-10 leading-relaxed font-light">
                        Secure your seat to witness extraordinary performances at The Gospel Icon Season 2. Choose your ticket tier, pay via transfer, and upload the proof.
                    </p>

                    <div className="glass p-6 rounded-2xl border border-white/10 mb-8">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-gold" /> Payment Details</h3>
                        <p className="text-sm text-gray-400 mb-4">Transfer your selected ticket amount to the official foundation account below:</p>
                        <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-2 font-mono text-sm">
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Bank:</span>
                                <strong className="text-white">Access Bank</strong>
                            </div>
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Account No:</span>
                                <strong className="text-gold-light text-base">0103014084</strong>
                            </div>
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Account Name:</span>
                                <strong className="text-white text-right">Cindy Chisimdi</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Type Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {ticketOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => setFormData({ ...formData, ticketType: opt.id })}
                                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all ${formData.ticketType === opt.id ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/30 bg-black/40'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-white">{opt.name}</h4>
                                        <Ticket className={`w-5 h-5 ${formData.ticketType === opt.id ? 'text-gold' : 'text-gray-500'}`} />
                                    </div>
                                    <div className={`text-2xl font-black mb-2 ${formData.ticketType === opt.id ? 'text-gold-light' : 'text-gray-300'}`}>{opt.price}</div>
                                    <p className="text-xs text-gray-500">{opt.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                                    placeholder="08012345678"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                                placeholder="Where should we send your ticket?"
                            />
                        </div>

                        {/* Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Payment Receipt Image</label>
                            <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${receipt ? 'border-gold bg-gold/5' : 'border-white/20 hover:border-white/50 bg-black/50'}`}>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="pointer-events-none flex flex-col items-center">
                                    {receipt ? (
                                        <>
                                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            </div>
                                            <span className="text-sm font-medium text-gold-light truncate max-w-[200px]">{receipt.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-500 mb-2 group-hover:text-gold transition-colors" />
                                            <span className="text-sm font-medium text-gray-300">Tap to Upload Receipt</span>
                                            <p className="text-xs text-gray-600 mt-1">JPG, PNG, or PDF</p>
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
                            className="w-full flex items-center px-8 py-4 rounded-full text-lg font-bold text-black bg-gradient-to-tr from-gold to-gold-light justify-center hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100 shadow-[0_4px_20px_rgba(223,177,75,0.3)] mt-8"
                        >
                            {isSubmitting ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
                                />
                            ) : (
                                "Buy Ticket"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
