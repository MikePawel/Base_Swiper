"use client";

import React, { useState, useMemo, useRef } from "react";
import TinderCard from "react-tinder-card";
import { CardData, dummyCards } from "~/data/dummyCards";
import { sdk } from "@farcaster/miniapp-sdk";

interface SwipeCardsProps {
  onBuy?: (card: CardData) => void;
  onPass?: (card: CardData) => void;
}

const SwipeCards: React.FC<SwipeCardsProps> = ({ onBuy, onPass }) => {
  const [cards, setCards] = useState<CardData[]>([...dummyCards]);
  const [currentIndex, setCurrentIndex] = useState(dummyCards.length - 1);
  const [resetKey, setResetKey] = useState(0);
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(dummyCards.length)
        .fill(0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(() => React.createRef<any>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey]
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

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
    setCards([...dummyCards]);
    updateCurrentIndex(dummyCards.length - 1);
    setResetKey((prev) => prev + 1);
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
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Card Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-xs font-semibold">
                        {card.category}
                      </span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                        {card.price}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{card.name}</h3>
                    <p className="text-white/90 text-sm">{card.description}</p>
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

      {/* Counter */}
      <div className="text-center text-sm text-gray-600 mt-8">
        {currentIndex >= 0 ? (
          <span>
            {currentIndex + 1} / {cards.length} items remaining
          </span>
        ) : (
          <span>No more items</span>
        )}
      </div>

      <style jsx>{`
        /* Swipe indicator animations */
        :global(.swipe-left-indicator),
        :global(.swipe-right-indicator) {
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SwipeCards;
