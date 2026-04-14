"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Upload, CheckCircle } from "lucide-react";

export default function Register() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    phone: "",
    address: "",
    email: "",
    category: "",
    whyCompete: "",
    description: "",
    holySpiritRelation: "",
    fiveYearVision: "",
  });

  const [video, setVideo] = useState<File | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    return formData.fullName && formData.dob && formData.phone && formData.address && formData.email && formData.category;
  };

  const validateStep2 = () => {
    return formData.whyCompete && formData.description && formData.holySpiritRelation && formData.fiveYearVision;
  };

  const validateStep3 = () => {
    return video !== null && receipt !== null;
  };

  const nextStep = () => {
    setErrorMsg("");
    if (step === 1 && !validateStep1()) {
      setErrorMsg("Please fill in all personal details.");
      return;
    }
    if (step === 2 && !validateStep2()) {
      setErrorMsg("Please answer all ministry questions.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) {
      setErrorMsg("Please upload both your audition video and payment receipt.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const timestamp = Date.now();
      const safeName = formData.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      // Upload Video
      const videoExt = video!.name.split('.').pop();
      const videoPath = `${safeName}_${timestamp}_video.${videoExt}`;

      // Upload Receipt
      const receiptExt = receipt!.name.split('.').pop();
      const receiptPath = `${safeName}_${timestamp}_receipt.${receiptExt}`;

      // Helper function to upload via presigned URL
      const uploadWithPresigned = async (file: File, path: string) => {
        const res = await fetch("/api/upload/url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: path, contentType: file.type })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get upload URL");

        const uploadRes = await fetch(data.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file
        });
        if (!uploadRes.ok) throw new Error("Upload to cloud failed");

        return data.publicUrl || path; // Returns either the full R2 URL or just the path if no public URL configured
      };

      // Upload files concurrently
      const [videoUrl, receiptUrl] = await Promise.all([
        uploadWithPresigned(video!, videoPath),
        uploadWithPresigned(receipt!, receiptPath)
      ]);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          videoUrl,
          receiptUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Registration failed");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
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
          <h2 className="text-3xl font-bold mb-4">Registration Successful!</h2>
          <p className="text-gray-400 mb-8">
            Thank you for registering for The Gospel Icon Season 2. We have received your details and first audition video.
          </p>
          <div className="bg-gold/10 border border-gold/20 p-6 rounded-2xl mb-8 text-left">
            <h4 className="text-gold-light font-bold mb-2 text-sm uppercase tracking-widest">Next Step: Second Audition</h4>
            <p className="text-xs text-zinc-400 leading-relaxed"> Once your payment is verified by our team, you will be required to submit your second audition video (song with instrumentals). Keep your registration email handy.</p>
            <Link
              href="/auditions/second-video"
              className="inline-flex mt-4 text-xs font-bold text-gold hover:text-gold-light underline underline-offset-4"
            >
              Go to Second Video Submission →
            </Link>
          </div>
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
    <div className="min-h-screen bg-black text-white selection:bg-gold/30 selection:text-gold-light py-20 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-gold/5 pt-[10%] to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">

        <div className="text-center mb-12">
          <Link href="/" className="text-gold hover:text-gold-light text-sm font-medium mb-6 inline-flex items-center transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Audition <span className="text-gradient-gold">Registration</span>
          </h1>
          <p className="text-gray-400">Complete the steps below to secure your spot in Season 2.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-gold to-gold-light rounded-full -z-10 transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= num
                ? "bg-gradient-to-tr from-gold to-gold-light text-black shadow-[0_0_15px_rgba(223,177,75,0.4)]"
                : "bg-black border border-white/20 text-gray-500"
                }`}
            >
              {num}
            </div>
          ))}
        </div>

        <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* STEP 1: Personal Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Personal Information</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                        placeholder="+234..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-white"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Home Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                      placeholder="Street address, City, State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Competition Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all origin-top appearance-none"
                    >
                      <option value="" disabled className="text-gray-500">Select a category...</option>
                      <option value="music">Gospel Music</option>
                      <option value="instrumentalist">Instrumentalist</option>
                      <option value="spoken_word">Spoken Word</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Ministry Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Ministry Profile</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Describe yourself in a few sentences</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Why do you want to be in the competition?</label>
                    <textarea
                      name="whyCompete"
                      value={formData.whyCompete}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all resize-none"
                      placeholder="Your motivation..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">What is your relationship with the Holy Spirit?</label>
                    <textarea
                      name="holySpiritRelation"
                      value={formData.holySpiritRelation}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all resize-none"
                      placeholder="Share your spiritual journey..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Where do you see yourself in the next 5 years as a minister?</label>
                    <textarea
                      name="fiveYearVision"
                      value={formData.fiveYearVision}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-4 rounded-xl bg-black/50 border border-white/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all resize-none"
                      placeholder="Your vision..."
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Uploads & Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Uploads & Payment</h2>

                  {/* Payment Info */}
                  <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
                    <h3 className="font-bold text-gold-light text-lg mb-4">Payment Instruction</h3>
                    <div className="space-y-2 text-gray-300">
                      <p className="flex justify-between"><span className="text-gray-400">Registration Fee:</span> <span className="font-bold text-white">₦5,000</span></p>
                      <p className="flex justify-between"><span className="text-gray-400">Bank Name:</span> <span className="font-medium text-white">Access Bank</span></p>
                      <p className="flex justify-between"><span className="text-gray-400">Account Name:</span> <span className="font-medium text-white">Cindy Chisimdi</span></p>
                      <p className="flex justify-between"><span className="text-gray-400">Account Number:</span> <span className="font-bold tracking-widest text-white">0103014084</span></p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Video Upload */}
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Audition Video (Max 1 Min)</label>
                      <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${video ? 'border-gold bg-gold/5' : 'border-white/20 hover:border-white/50 bg-black/50'}`}>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideo(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="pointer-events-none flex flex-col items-center">
                          {video ? (
                            <>
                              <CheckCircle className="w-8 h-8 text-gold mb-2" />
                              <span className="text-sm text-gold-light truncate max-w-[150px]">{video.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-500 mb-2 group-hover:text-gold transition-colors" />
                              <span className="text-sm text-gray-400">Click to upload video</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Receipt Upload */}
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Payment Receipt</label>
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
                              <CheckCircle className="w-8 h-8 text-gold mb-2" />
                              <span className="text-sm text-gold-light truncate max-w-[150px]">{receipt.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-500 mb-2 group-hover:text-gold transition-colors" />
                              <span className="text-sm text-gray-400">Click to upload receipt</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>

            {/* Error Message */}
            {errorMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                {errorMsg}
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex justify-between items-center pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                  }`}
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-8 py-3 rounded-full text-sm font-bold text-black bg-gradient-to-tr from-gold to-gold-light hover:scale-105 transition-transform"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1 -mr-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-8 py-3 rounded-full text-sm font-bold text-black bg-gradient-to-tr from-gold to-gold-light justify-center hover:scale-105 transition-transform disabled:opacity-70 disabled:hover:scale-100 min-w-[160px]"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                    />
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}