// src/components/ReplyMessage.jsx
import React from "react";

const ReplyMessage = ({ replyTo, onCancel }) => {
  if (!replyTo) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-700/60 rounded-t-lg text-sm border-l-4 border-blue-500">
      <div className="truncate">
        <p className="font-medium text-blue-300">
          Replying to {replyTo.senderName || "User"}:
        </p>
        <p className="text-gray-200 text-xs truncate max-w-[250px]">
          {replyTo.text || "Media message"}
        </p>
      </div>
      <button
        onClick={onCancel}
        className="text-gray-400 hover:text-gray-200 text-lg"
      >
        ✕
      </button>
    </div>
  );
};

export default ReplyMessage;
