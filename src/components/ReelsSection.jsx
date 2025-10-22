import React, { useState, useRef } from "react";

const reels = [
  { id: 1, src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 2, src: "https://www.w3schools.com/html/movie.mp4" },
  { id: 3, src: "https://www.w3schools.com/html/movie.mp4" },
  { id: 4, src: "https://www.w3schools.com/html/movie.mp4" },
  { id: 5, src: "https://www.w3schools.com/html/movie.mp4" },
  { id: 2, src: "https://www.w3schools.com/html/movie.mp4" },
  { id: 2, src: "https://www.w3schools.com/html/movie.mp4" },
  { id: 2, src: "https://www.w3schools.com/html/movie.mp4" },
];

export default function ReelsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (diff > 50 && currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (diff < -50 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <video
        key={reels[currentIndex].id}
        src={reels[currentIndex].src}
        controls
        autoPlay
        loop
        className="h-[90%] rounded-2xl"
      />
    </div>
  );
}
