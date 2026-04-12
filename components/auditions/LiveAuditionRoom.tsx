"use client";

import { useEffect, useState, useRef } from "react";
import AgoraRTC, {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Music, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveAuditionRoomProps {
    appId: string;
    token: string;
    channelName: string;
    uid: string;
    contestantName: string;
    assignedSong?: string;
    onLeave: () => void;
}

export default function LiveAuditionRoom({
    appId,
    token,
    channelName,
    uid,
    contestantName,
    assignedSong,
    onLeave
}: LiveAuditionRoomProps) {
    const [client, setClient] = useState<IAgoraRTCClient | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isJoined, setIsJoined] = useState(false);

    const localVideoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            setClient(agoraClient);

            agoraClient.on("user-published", async (user, mediaType) => {
                await agoraClient.subscribe(user, mediaType);
                if (mediaType === "video") {
                    setRemoteUsers((prev) => {
                        const exists = prev.find((u) => u.uid === user.uid);
                        if (exists) return prev;
                        return [...prev, user];
                    });
                }
                if (mediaType === "audio") {
                    user.audioTrack?.play();
                }
            });

            agoraClient.on("user-unpublished", (user) => {
                setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
            });

            try {
                await agoraClient.join(appId, channelName, token, parseInt(uid));

                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                setLocalAudioTrack(audioTrack);
                setLocalVideoTrack(videoTrack);

                if (localVideoRef.current) {
                    videoTrack.play(localVideoRef.current);
                }

                await agoraClient.publish([audioTrack, videoTrack]);
                setIsJoined(true);
            } catch (error) {
                console.error("Agora Join Error:", error);
            }
        };

        init();

        return () => {
            localAudioTrack?.close();
            localVideoTrack?.close();
            client?.leave();
            client?.removeAllListeners();
        };
    }, []);

    const toggleMic = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setEnabled(!isMicOn);
            setIsMicOn(!isMicOn);
        }
    };

    const toggleVideo = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(!isVideoOn);
            setIsVideoOn(!isVideoOn);
        }
    };

    const handleLeave = async () => {
        await client?.leave();
        localAudioTrack?.close();
        localVideoTrack?.close();
        onLeave();
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col md:flex-row overflow-hidden">
            {/* Main Stage */}
            <div className="flex-1 relative bg-zinc-900">
                {/* Remote Users (Judges) */}
                <div className="absolute inset-0 grid grid-cols-1 gap-1">
                    {remoteUsers.length > 0 ? (
                        remoteUsers.map((user) => (
                            <div key={user.uid} className="relative w-full h-full">
                                <RemoteVideoPlayer user={user} />
                                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-white font-medium">Judge (Live)</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center animate-pulse">
                                <User className="w-10 h-10" />
                            </div>
                            <p className="text-lg font-medium">Waiting for judge to join...</p>
                        </div>
                    )}
                </div>

                {/* Local Video Thumbnail */}
                <div className="absolute top-6 right-6 w-48 md:w-64 aspect-video rounded-2xl overflow-hidden border-2 border-gold shadow-2xl z-10 bg-black">
                    <div ref={localVideoRef} className="w-full h-full object-cover" />
                    {!isVideoOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                            <VideoOff className="w-8 h-8 text-zinc-500" />
                        </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold text-gold">
                        You
                    </div>
                </div>

                {/* Assigned Song Info */}
                <AnimatePresence>
                    {assignedSong && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute top-6 left-6 z-10"
                        >
                            <div className="glass p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                                <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                                    <Music className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Current Song</p>
                                    <h3 className="text-white font-bold">{assignedSong}</h3>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                    <button
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-500 text-white'}`}
                    >
                        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-500 text-white'}`}
                    >
                        {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>
                    <button
                        onClick={handleLeave}
                        className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>

            {/* Sidebar (Optional: Chat or Lyrics) */}
            <div className="w-full md:w-80 bg-zinc-950 border-l border-white/5 p-6 space-y-8 h-auto md:h-full">
                <div>
                    <h2 className="text-xl font-bold mb-2">Live Audition</h2>
                    <p className="text-zinc-500 text-sm">Contestant: <span className="text-white">{contestantName}</span></p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Guidelines</h4>
                    <ul className="space-y-3">
                        {['Ensure good lighting', 'Check your audio levels', 'Stay in frame', 'Perform with confidence'].map((tip, i) => (
                            <li key={i} className="flex items-center gap-3 text-zinc-400 text-sm">
                                <div className="w-1 h-1 bg-gold rounded-full" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                    <div className="p-4 rounded-2xl bg-gold/5 border border-gold/20 text-center">
                        <p className="text-gold-light text-xs font-medium">Recording in progress</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RemoteVideoPlayer({ user }: { user: IAgoraRTCRemoteUser }) {
    const videoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user.videoTrack && videoRef.current) {
            user.videoTrack.play(videoRef.current);
        }
    }, [user.videoTrack]);

    return <div ref={videoRef} className="w-full h-full object-cover" />;
}
