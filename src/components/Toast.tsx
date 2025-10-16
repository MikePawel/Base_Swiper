"use client";

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onClose,
  type = "success",
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto-hide after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-gray-900",
    error: "bg-red-600",
    info: "bg-gray-700",
  }[type];

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[10000] animate-slide-up">
      <div className={`${bgColor} text-white px-4 py-2 rounded-lg shadow-lg`}>
        <span className="text-xs font-medium">{message}</span>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Toast;
