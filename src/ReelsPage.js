import React, { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiHeart, FiVolume2, FiVolumeX } from "react-icons/fi";

export default function ReelsPage({ onBack }) {
  const [liked, setLiked] = useState({});
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef([]);

  // Manually add paths of your downloaded videos
  const reels = [
    { id: 1, video: "/videos/Video-143.mp4", caption: "My first reel" },
    { id: 2, video: "/videos/Video-172.mp4", caption: "Another cool reel" },
    { id: 3, video: "/videos/Video-391.mp4", caption: "Fun moments" },
    { id: 4, video: "/videos/Video-581.mp4", caption: "Fun moments" },
    { id: 5, video: "/videos/Video-584.mp4", caption: "Fun moments" },
    { id: 6, video: "/videos/Video-600.mp4", caption: "Fun moments" },
    { id: 7, video: "/videos/Video-650.mp4", caption: "Fun moments" },
    { id: 8, video: "/videos/Video-766.mp4", caption: "Fun moments" },
    { id: 9, video: "/videos/Video-862.mp4", caption: "Fun moments" },
    { id: 11, video: "/videos/Video-867.mp4", caption: "Fun moments" },
    { id: 12, video: "/videos/Video-698.mp4", caption: "Fun moments" },
    { id: 13, video: "/videos/Video-378.mp4", caption: "Fun moments" },
    { id: 14, video: "/videos/Video-750.mp4", caption: "Fun moments" },
    { id: 15, video: "/videos/Video-766.mp4", caption: "Fun moments" },
    { id: 16, video: "/videos/Video-146.mp4", caption: "Fun moments" },
    { id: 17, video: "/videos/Video-162.mp4", caption: "Fun moments" },
    { id: 18, video: "/videos/Video-292.mp4", caption: "Fun moments" },
    { id: 19, video: "/videos/Video-580.mp4", caption: "Fun moments" },

    // add more paths here
  ];

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSound = () => {
    setMuted((prev) => !prev);
  };

  // Auto-play / pause while scrolling
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
    <div className="fixed inset-0 bg-black text-white z-50">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full flex items-center px-4 py-3   z-50">
        <button
          onClick={onBack}
          className="text-gray-200 hover:text-white p-2 rounded-full hover:bg-gray-800 transition"
        >
          <FiArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-xl font-semibold">Reels</h2>
      </div>

      {/* Reels */}
      <div className="h-full overflow-y-scroll snap-y snap-mandatory">
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="relative h-screen w-full flex items-center justify-center snap-start"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={reel.video}
              loop
              muted={muted}
              playsInline
              className="w-auto h-full object-cover"
            ></video>

            {/* Caption */}
            <div className="absolute bottom-20 left-5 text-lg font-medium drop-shadow-md">
              {reel.caption}
            </div>

            {/* Like + Sound */}
            <div className="absolute bottom-28 right-6 flex flex-col items-center space-y-4">
              <button
                onClick={() => toggleLike(reel.id)}
                className={`p-3 rounded-full ${
                  liked[reel.id] ? "bg-red-600" : "bg-gray-700/70"
                } transition-all`}
              >
                <FiHeart
                  size={22}
                  className={liked[reel.id] ? "fill-white text-white" : ""}
                />
              </button>

              <button
                onClick={toggleSound}
                className="p-3 rounded-full bg-gray-700/70 hover:bg-gray-600 transition"
              >
                {muted ? <FiVolumeX size={22} /> : <FiVolume2 size={22} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
