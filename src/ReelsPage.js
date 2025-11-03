import React, { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiHeart, FiVolume2, FiVolumeX, FiMessageCircle, FiSend, FiMoreHorizontal } from "react-icons/fi";

export default function ReelsPage({ onBack }) {
  const [liked, setLiked] = useState({});
  const [likeCount, setLikeCount] = useState({});
  const [muted, setMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(null);
  const videoRefs = useRef([]);

  // Mock data (replace with real usernames, music, etc.)
  const reels = [
    { id: 1, video: "/videos/Video-143.mp4", username: "john_doe", caption: "Living my best life", music: "Original Audio" },
    { id: 2, video: "/videos/Video-172.mp4", username: "jane_smith", caption: "Dance challenge", music: "Trending Sound" },
    { id: 3, video: "/videos/Video-391.mp4", username: "alex", caption: "Morning vibes", music: "Lo-fi Beats" },
    { id: 4, video: "/videos/Video-581.mp4", username: "mike", caption: "Travel goals", music: "Summer Vibes" },
    { id: 5, video: "/videos/Video-584.mp4", username: "sara", caption: "Coffee time", music: "Chillhop" },
    { id: 6, video: "/videos/Video-600.mp4", username: "lisa", caption: "Sunset views", music: "Acoustic" },
    { id: 7, video: "/videos/Video-650.mp4", username: "chris", caption: "Workout mode", music: "Motivation" },
    { id: 8, video: "/videos/Video-766.mp4", username: "emma", caption: "Art in motion", music: "Piano" },
    { id: 9, video: "/videos/Video-862.mp4", username: "david", caption: "Coding at 3AM", music: "Lofi" },
    { id: 11, video: "/videos/Video-867.mp4", username: "nina", caption: "Fashion week", music: "Runway" },
    { id: 12, video: "/videos/Video-698.mp4", username: "tom", caption: "Gaming setup", music: "Epic" },
    { id: 13, video: "/videos/Video-378.mp4", username: "olivia", caption: "Pet love", music: "Cute" },
    { id: 14, video: "/videos/Video-750.mp4", username: "ryan", caption: "Street food", music: "World" },
    { id: 15, video: "/videos/Video-766.mp4", username: "zoe", caption: "Nature walk", music: "Calm" },
    { id: 16, video: "/videos/Video-146.mp4", username: "leo", caption: "Skydiving", music: "Adrenaline" },
    { id: 17, video: "/videos/Video-162.mp4", username: "mia", caption: "Book nook", music: "Reading" },
    { id: 18, video: "/videos/Video-292.mp4", username: "noah", caption: "DIY project", music: "Creative" },
    { id: 19, video: "/videos/Video-580.mp4", username: "ava", caption: "Sunrise yoga", music: "Zen" },
  ];

  // Initialize like counts
  useEffect(() => {
    const initialCounts = {};
    reels.forEach((reel) => {
      initialCounts[reel.id] = Math.floor(Math.random() * 500) + 50;
    });
    setLikeCount(initialCounts);
  }, []);

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    setLikeCount((prev) => ({
      ...prev,
      [id]: prev[id] + (liked[id] ? -1 : 1),
    }));
  };

  const handleDoubleTap = (id) => {
    if (!liked[id]) {
      toggleLike(id);
      setShowHeart(id);
      setTimeout(() => setShowHeart(null), 800);
    }
  };

  const toggleSound = () => setMuted((prev) => !prev);

  // Intersection Observer for auto-play
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white z-50 overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-50">
        <button
          onClick={onBack}
          className="text-white p-2 rounded-full hover:bg-white/10 transition"
        >
          <FiArrowLeft size={26} />
        </button>
        <h1 className="text-xl font-bold">Reels</h1>
        <div className="w-10" />
      </div>

      {/* Reels Container */}
      <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="relative h-screen w-full flex items-center justify-center snap-start bg-black"
            onDoubleClick={() => handleDoubleTap(reel.id)}
          >
            {/* Video */}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={reel.video}
              loop
              muted={muted}
              playsInline
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Double-tap Heart Animation */}
            {showHeart === reel.id && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <FiHeart
                  size={100}
                  className="text-white opacity-0 animate-heart-pop"
                />
              </div>
            )}

            {/* Gradient Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Caption + Username */}
            <div className="absolute bottom-20 left-4 right-16 text-left">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold">
                    {reel.username[0].toUpperCase()}
                  </div>
                </div>
                <span className="font-semibold text-sm">{reel.username}</span>
                <button className="ml-2 px-3 py-1 text-xs font-semibold border border-white/50 rounded-full hover:bg-white/10 transition">
                  Follow
                </button>
              </div>
              <p className="text-sm line-clamp-2">{reel.caption}</p>
              <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                <FiVolume2 size={14} />
                <span>{reel.music}</span>
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 text-white">
              {/* Like */}
              <button
                onClick={() => toggleLike(reel.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`p-3 rounded-full transition-all ${liked[reel.id] ? "text-red-500" : "text-white"} group-hover:scale-110`}>
                  <FiHeart size={28} className={liked[reel.id] ? "fill-current" : ""} />
                </div>
                <span className="text-xs font-medium">{likeCount[reel.id] || 0}</span>
              </button>

              {/* Comment */}
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 rounded-full transition-all group-hover:scale-110">
                  <FiMessageCircle size={28} />
                </div>
                <span className="text-xs font-medium">12.3k</span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 rounded-full transition-all group-hover:scale-110">
                  <FiSend size={26} />
                </div>
                <span className="text-xs font-medium">Send</span>
              </button>

              {/* More */}
              <button className="p-3 rounded-full hover:bg-white/10 transition">
                <FiMoreHorizontal size={26} />
              </button>

              {/* Music Disc */}
              <div className="mt-2 w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 animate-spin-slow">
                <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500" />
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="absolute bottom-32 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm"
            >
              {muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
            </button>
          </div>
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes heart-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-heart-pop {
          animation: heart-pop 0.8s ease-out;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}