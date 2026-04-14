"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ChevronRight } from "lucide-react";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/secure-admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                throw new Error("Invalid username or password");
            }

            router.push("/secure-admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-gold/30 selection:text-gold-light">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-gold/5 pt-[10%] to-transparent pointer-events-none -z-10" />

            <div className="w-full max-w-sm glass p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="w-16 h-16 bg-gradient-to-tr from-gold to-gold-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(223,177,75,0.3)]">
                    <Lock className="w-8 h-8 text-black" />
                </div>

                <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
                <p className="text-gray-400 text-center text-sm mb-8">Enter the master password to continue.</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Admin Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-4 mb-4 rounded-xl bg-white/5 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-center tracking-widest"
                            required
                        />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-center tracking-widest"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-4 rounded-xl text-sm font-bold text-black bg-gradient-to-tr from-gold to-gold-light hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {loading ? "Verifying..." : (
                            <>Enter Vault <ChevronRight className="w-4 h-4 ml-1" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
