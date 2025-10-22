// Messages.jsx
import React from "react";

export default function Messages() {
  return (
    <div className="p-4 overflow-y-auto h-[calc(100vh-450px)]">
      <div className="flex flex-col space-y-2">
        <div className="bg-white p-2 rounded shadow self-start">
          Hi! Welcome to React Chat App 💬
        </div>
        <div className="bg-indigo-100 p-2 rounded shadow self-end">
          Hello! Check out the Reels below 🎥
        </div>
      </div>
    </div>
  );
}
