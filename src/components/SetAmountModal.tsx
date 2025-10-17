"use client";

import React, { useState, useEffect } from "react";

interface SetAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetAmount: (amount: string) => void;
  currentAmount?: string;
  isFirstTime?: boolean;
}

const SetAmountModal: React.FC<SetAmountModalProps> = ({
  isOpen,
  onClose,
  onSetAmount,
  currentAmount = "0.1",
  isFirstTime = false,
}) => {
  const [amount, setAmount] = useState(currentAmount);
  const [error, setError] = useState("");

  useEffect(() => {
    setAmount(currentAmount);
  }, [currentAmount, isOpen]);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (numAmount > 1000) {
      setError("Amount cannot exceed 1000 USDC");
      return;
    }

    setError("");
    onSetAmount(amount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isFirstTime ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
        {!isFirstTime && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">💰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isFirstTime ? "Welcome!" : "Set Spending Amount"}
          </h2>
          <p className="text-sm text-gray-600">
            {isFirstTime
              ? "How much USDC do you want to spend per token?"
              : "Adjust your spending amount per token"}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="1000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg font-semibold"
                placeholder="0.1"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                USDC
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {/* Quick Select Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {["0.1", "1", "10", "100"].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  amount === preset
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            {isFirstTime ? "Get Started" : "Save Amount"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SetAmountModal;
