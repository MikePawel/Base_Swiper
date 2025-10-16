"use client";

import React, { useEffect } from "react";
import { CardData } from "~/data/dummyCards";

interface CoinDetailModalProps {
  card: CardData;
  isOpen: boolean;
  onClose: () => void;
  onBuy?: () => void;
  onSkip?: () => void;
}

const CoinDetailModal: React.FC<CoinDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onBuy,
  onSkip,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatNumber = (num?: string) => {
    if (!num) return "N/A";
    const value = parseFloat(num);
    if (isNaN(value)) return "N/A";
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatSupply = (supply?: string) => {
    if (!supply) return "N/A";
    const value = parseFloat(supply);
    if (isNaN(value)) return "N/A";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toLocaleString();
  };

  const formatAddress = (address?: string) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a toast notification here
      console.log("Copied to clipboard:", text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 max-h-[90vh] flex flex-col ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <svg
            className="w-6 h-6"
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto">
          {/* Image Section */}
          <div className="relative w-full h-80 sm:h-96 flex-shrink-0 bg-gray-100">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-4 py-2 bg-blue-500/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                {card.category}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-6 space-y-6">
            {/* Title & Symbol */}
            <div>
              <div className="flex items-start gap-4">
                <h2 className="text-3xl font-bold text-gray-900 leading-tight flex-1 min-w-0">
                  {card.name}
                </h2>
                {card.coinData?.symbol && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md flex-shrink-0 self-start">
                    ${card.coinData.symbol}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed break-words whitespace-pre-line">
                {card.description}
              </p>
            </div>

            {/* Market Stats Grid */}
            {card.coinData && (
              <div className="grid grid-cols-2 gap-4">
                {/* Market Cap */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs font-medium text-blue-700">
                      Market Cap
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">
                    {formatNumber(card.coinData.marketCap)}
                  </p>
                </div>

                {/* 24h Volume */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <p className="text-xs font-medium text-green-700">
                      24h Volume
                    </p>
                  </div>
                  <p className="text-xl font-bold text-green-900">
                    {formatNumber(card.coinData.volume24h)}
                  </p>
                </div>

                {/* Total Supply */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <p className="text-xs font-medium text-purple-700">
                      Total Supply
                    </p>
                  </div>
                  <p className="text-xl font-bold text-purple-900">
                    {formatSupply(card.coinData.totalSupply)}
                  </p>
                </div>

                {/* Holders */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-xs font-medium text-orange-700">
                      Holders
                    </p>
                  </div>
                  <p className="text-xl font-bold text-orange-900">
                    {card.coinData.uniqueHolders?.toLocaleString() || "N/A"}
                  </p>
                </div>
              </div>
            )}

            {/* Token Details */}
            {card.coinData && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Token Details
                </h3>

                {/* Contract Address */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Contract Address
                      </p>
                      <p className="text-sm font-mono text-gray-900">
                        {formatAddress(card.coinData.address)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        card.coinData?.address &&
                        copyToClipboard(card.coinData.address)
                      }
                      className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Creator Address */}
                {card.coinData.creatorAddress && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Creator Address
                        </p>
                        <p className="text-sm font-mono text-gray-900">
                          {formatAddress(card.coinData.creatorAddress)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          card.coinData?.creatorAddress &&
                          copyToClipboard(card.coinData.creatorAddress)
                        }
                        className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Chain ID */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Chain
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {card.coinData.chainId === 8453
                        ? "Base"
                        : `Chain ${card.coinData.chainId}`}
                    </p>
                  </div>

                  {/* Created Date */}
                  {card.coinData.createdAt && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Created
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(card.coinData.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sleek Action Buttons */}
            <div className="flex gap-3 pt-4 pb-2">
              {/* Skip Button */}
              <button
                onClick={() => {
                  onSkip?.();
                }}
                className="flex-1 py-4 px-6 bg-white rounded-2xl font-semibold text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:scale-98"
              >
                Skip
              </button>

              {/* Buy Button */}
              <button
                onClick={() => {
                  onBuy?.();
                }}
                className="flex-1 py-4 px-6 bg-gray-900 rounded-2xl font-semibold text-white hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-98"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetailModal;
