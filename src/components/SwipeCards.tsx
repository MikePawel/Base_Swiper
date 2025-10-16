"use client";

import React, { useState, useMemo, useRef } from "react";
import TinderCard from "react-tinder-card";
import { CardData, dummyCards } from "~/data/dummyCards";
import { sdk } from "@farcaster/miniapp-sdk";
import CoinDetailModal from "./CoinDetailModal";

interface SwipeCardsProps {
  onBuy?: (card: CardData) => void;
  onPass?: (card: CardData) => void;
  cards?: CardData[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

const SwipeCards: React.FC<SwipeCardsProps> = ({
  onBuy,
  onPass,
  cards: initialCards,
  initialIndex,
  onIndexChange,
}) => {
  const cardsData =
    initialCards && initialCards.length > 0 ? initialCards : dummyCards;
  const [cards, setCards] = useState<CardData[]>([...cardsData]);
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex !== undefined && initialIndex >= 0
      ? initialIndex
      : cardsData.length - 1
  );
  const [resetKey, setResetKey] = useState(0);
  const currentIndexRef = useRef(currentIndex);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track touch/mouse position to detect tap vs drag
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const updateCurrentIndex = React.useCallback(
    (val: number) => {
      setCurrentIndex(val);
      currentIndexRef.current = val;
      if (onIndexChange) {
        onIndexChange(val);
      }
    },
    [onIndexChange]
  );

  // Initialize with saved index and sync when props change
  React.useEffect(() => {
    if (initialCards && initialCards.length > 0) {
      console.log(
        `SwipeCards: Syncing ${initialCards.length} cards, index ${initialIndex}`
      );
      setCards([...initialCards]);
      const startIndex =
        initialIndex !== undefined && initialIndex >= 0
          ? initialIndex
          : initialCards.length - 1;
      updateCurrentIndex(startIndex);
    }
  }, [initialCards, initialIndex, updateCurrentIndex]);

  const childRefs = useMemo(
    () =>
      Array(cards.length)
        .fill(0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(() => React.createRef<any>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey, cards.length]
  );

  const swiped = async (direction: string, cardData: CardData) => {
    updateCurrentIndex(currentIndexRef.current - 1);

    // Trigger haptic feedback
    try {
      await sdk.haptics.impactOccurred("medium");
    } catch (error) {
      console.log("Haptics not supported:", error);
    }

    // Call callbacks based on direction
    if (direction === "right") {
      onBuy?.(cardData);
    } else if (direction === "left") {
      onPass?.(cardData);
    }
  };

  const outOfFrame = (cardName: string) => {
    console.log(`${cardName} left the screen!`);
  };

  const handleStartOver = () => {
    setCards([...cardsData]);
    updateCurrentIndex(cardsData.length - 1);
    setResetKey((prev) => prev + 1);
  };

  const handleCardClick = (card: CardData) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCard(null), 300); // Delay clearing to allow animation
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const pos =
      "touches" in e
        ? { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY }
        : { x: e.clientX, y: e.clientY };
    touchStartPos.current = pos;
  };

  const handleTouchEnd = (
    e: React.TouchEvent | React.MouseEvent,
    card: CardData
  ) => {
    if (!touchStartPos.current) return;

    const endPos =
      "changedTouches" in e
        ? { x: e.changedTouches[0]!.clientX, y: e.changedTouches[0]!.clientY }
        : { x: e.clientX, y: e.clientY };

    // Calculate distance moved
    const deltaX = Math.abs(endPos.x - touchStartPos.current.x);
    const deltaY = Math.abs(endPos.y - touchStartPos.current.y);

    // If movement is less than 10px, consider it a tap
    if (deltaX < 10 && deltaY < 10) {
      handleCardClick(card);
    }

    touchStartPos.current = null;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Cards Container */}
      <div className="relative w-full max-w-sm" style={{ height: "550px" }}>
        {cards.map((card, index) => {
          // Only render cards at current index or below (up to 3 cards in stack)
          const shouldRender =
            index >= currentIndex - 2 && index <= currentIndex;
          if (!shouldRender) return null;

          const isTopCard = index === currentIndex;
          const distanceFromTop = currentIndex - index;

          // Calculate transform for card stack effect
          const scale = 1 - distanceFromTop * 0.05;
          const translateY = distanceFromTop * 10;
          const opacity = 1 - distanceFromTop * 0.2;

          return (
            <div
              key={`${resetKey}-${card.id}`}
              className="absolute w-full"
              style={{ zIndex: index }}
            >
              <TinderCard
                ref={childRefs[index]}
                onSwipe={(dir) => swiped(dir, card)}
                onCardLeftScreen={() => outOfFrame(card.name)}
                preventSwipe={["up", "down"]}
              >
                <div
                  className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300"
                  onTouchStart={isTopCard ? handleTouchStart : undefined}
                  onTouchEnd={
                    isTopCard ? (e) => handleTouchEnd(e, card) : undefined
                  }
                  onMouseDown={isTopCard ? handleTouchStart : undefined}
                  onMouseUp={
                    isTopCard ? (e) => handleTouchEnd(e, card) : undefined
                  }
                  style={{
                    width: "100%",
                    height: "500px",
                    backgroundImage: `url(${card.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transform: !isTopCard
                      ? `scale(${scale}) translateY(${translateY}px)`
                      : "scale(1)",
                    opacity: opacity,
                    pointerEvents: isTopCard ? "auto" : "none",
                    cursor: isTopCard ? "pointer" : "default",
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Card Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-xs font-semibold">
                        {card.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{card.name}</h3>

                    {/* Key Metrics */}
                    <div className="flex items-center gap-4 mb-2">
                      {/* Price */}
                      {card.price && card.price !== "N/A" && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-green-400"
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
                          <span className="text-green-400 font-bold text-sm">
                            {card.price}
                          </span>
                        </div>
                      )}

                      {/* Market Cap */}
                      {card.coinData?.marketCap && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-white/80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          <span className="text-white/90 text-sm">
                            {(() => {
                              try {
                                const value = parseFloat(
                                  card.coinData.marketCap
                                );
                                if (isNaN(value)) return "N/A";
                                if (value >= 1000000)
                                  return `$${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000)
                                  return `$${(value / 1000).toFixed(1)}K`;
                                return `$${value.toFixed(0)}`;
                              } catch {
                                return "N/A";
                              }
                            })()}
                          </span>
                        </div>
                      )}

                      {/* Holders */}
                      {card.coinData?.uniqueHolders != null && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-white/80"
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
                          <span className="text-white/90 text-sm">
                            {typeof card.coinData.uniqueHolders === "number"
                              ? card.coinData.uniqueHolders.toLocaleString()
                              : card.coinData.uniqueHolders}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-white/70 text-xs mt-2 italic">
                      Tap for details
                    </p>
                  </div>

                  {/* Swipe Direction Indicators */}
                  <div className="absolute top-1/4 left-8 transform -rotate-12">
                    <div className="px-6 py-3 border-4 border-red-500 rounded-2xl opacity-0 swipe-left-indicator">
                      <span className="text-red-500 text-3xl font-bold">
                        PASS
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-1/4 right-8 transform rotate-12">
                    <div className="px-6 py-3 border-4 border-green-500 rounded-2xl opacity-0 swipe-right-indicator">
                      <span className="text-green-500 text-3xl font-bold">
                        BUY
                      </span>
                    </div>
                  </div>
                </div>
              </TinderCard>
            </div>
          );
        })}

        {/* Empty State */}
        {currentIndex < 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                All Done!
              </h3>
              <p className="text-gray-600">You&apos;ve reviewed all items</p>
              <button
                onClick={handleStartOver}
                className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* Swipe indicator animations */
        :global(.swipe-left-indicator),
        :global(.swipe-right-indicator) {
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
      `}</style>

      {/* Coin Detail Modal */}
      {selectedCard && (
        <CoinDetailModal
          card={selectedCard}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onBuy={() => {
            // Close modal immediately
            setIsModalOpen(false);
            // Clear selected card
            setSelectedCard(null);
            // Trigger right swipe programmatically
            setTimeout(() => {
              if (currentIndex >= 0 && childRefs[currentIndex]?.current) {
                childRefs[currentIndex].current.swipe("right");
              }
            }, 50);
          }}
          onSkip={() => {
            // Close modal immediately
            setIsModalOpen(false);
            // Clear selected card
            setSelectedCard(null);
            // Trigger left swipe programmatically
            setTimeout(() => {
              if (currentIndex >= 0 && childRefs[currentIndex]?.current) {
                childRefs[currentIndex].current.swipe("left");
              }
            }, 50);
          }}
        />
      )}
    </div>
  );
};

export default SwipeCards;
