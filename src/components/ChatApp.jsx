// ChatApp.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { VideoIcon } from "lucide-react"; // or use emoji 🎞️

export default function ChatApp() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-indigo-600 text-white text-center py-3 font-semibold text-lg">
        💬 React Chat App
      </div>

      {/* Chat messages area */}
      <div className="flex-1 p-4 overflow-y-auto">Your chat UI here</div>

      {/* Bottom navigation */}
      <div className="flex justify-around items-center bg-white border-t p-3">
        <button
          onClick={() => navigate("/reels")}
          className="flex flex-col items-center text-gray-600 hover:text-indigo-600 transition"
        >
          <VideoIcon size={24} />
          <span className="text-sm">Reels</span>
        </button>
      </div>
    </div>
  );
}
