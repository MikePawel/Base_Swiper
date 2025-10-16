/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useFrameContext } from "~/components/providers/FrameProvider";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount } from "wagmi";
import {
  WalletConnect,
  SignMessage,
  SignSiweMessage,
  SendEth,
  SignTypedData,
  SwitchChain,
  SendTransaction,
} from "~/components/wallet/WalletActions";
import { BasePay } from "~/components/wallet/BasePay";
import SwipeCards from "~/components/SwipeCards";
import { CardData } from "~/data/dummyCards";
import {
  fetchZoraExplore,
  transformZoraToCards,
  ListType,
} from "~/components/wallet/test";

type TabType = "swipe" | "buylist" | "wallet";
type WalletPageType = "list" | "basepay" | "wallet";

interface WalletActionDefinition {
  id: WalletPageType;
  name: string;
  description: string;
  component: React.ComponentType;
}

export default function Demo() {
  const frameContext = useFrameContext();
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("swipe");
  const [currentWalletPage, setCurrentWalletPage] =
    useState<WalletPageType>("list");
  const [capabilities, setCapabilities] = useState<any>(null);
  const [buyList, setBuyList] = useState<CardData[]>([]);
  const [newCards, setNewCards] = useState<CardData[]>([]);
  const [valuableCards, setValuableCards] = useState<CardData[]>([]);
  const [gainersCards, setGainersCards] = useState<CardData[]>([]);
  const [featuredCards, setFeaturedCards] = useState<CardData[]>([]);
  const [listType, setListType] = useState<ListType>("FEATURED");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showTabMenu, setShowTabMenu] = useState(false);

  // Track swipe progress for each filter
  const [swipeProgress, setSwipeProgress] = useState<{
    NEW: number;
    MOST_VALUABLE: number;
    TOP_GAINERS: number;
    FEATURED: number;
  }>({
    NEW: -1,
    MOST_VALUABLE: -1,
    TOP_GAINERS: -1,
    FEATURED: -1,
  });

  const handleBuy = (card: CardData) => {
    setBuyList((prev) => [...prev, card]);
    console.log("Added to buy list:", card);
  };

  const handlePass = (card: CardData) => {
    console.log("Passed:", card);
  };

  // Check capabilities on mount
  useEffect(() => {
    const getCapabilities = async () => {
      try {
        const caps = await sdk.getCapabilities();
        setCapabilities(caps);
      } catch (error) {
        console.error("Failed to get capabilities:", error);
      }
    };
    getCapabilities();
  }, []);

  // Fetch all Zora data on mount
  useEffect(() => {
    const getAllZoraData = async () => {
      setIsInitialLoading(true);

      // Fetch all four types in parallel
      const [newData, valuableData, gainersData, featuredData] =
        await Promise.all([
          fetchZoraExplore("NEW"),
          fetchZoraExplore("MOST_VALUABLE"),
          fetchZoraExplore("TOP_GAINERS"),
          fetchZoraExplore("FEATURED"),
        ]);

      if (newData) {
        const cards = transformZoraToCards(newData);
        setNewCards(cards);
      }

      if (valuableData) {
        const cards = transformZoraToCards(valuableData);
        setValuableCards(cards);
      }

      if (gainersData) {
        const cards = transformZoraToCards(gainersData);
        setGainersCards(cards);
      }

      if (featuredData) {
        const cards = transformZoraToCards(featuredData);
        setFeaturedCards(cards);
      }

      setIsInitialLoading(false);
    };

    getAllZoraData();
  }, []);

  // Close tab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTabMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest(".tab-menu-container")) {
          setShowTabMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTabMenu]);

  const WalletActionsComponent = () => (
    <div className="space-y-4">
      <SignMessage />
      <SignSiweMessage />
      <SendEth />
      <SendTransaction />
      <SignTypedData />
      <SwitchChain />
    </div>
  );

  const walletActionDefinitions: WalletActionDefinition[] = [
    {
      id: "basepay",
      name: "Base Pay",
      description: "Debug Base Pay",
      component: BasePay,
    },
    {
      id: "wallet",
      name: "Wallet",
      description: "Debug wallet interactions",
      component: WalletActionsComponent,
    },
  ];

  const handleTabChange = async (tab: TabType) => {
    if (capabilities?.includes("haptics.selectionChanged")) {
      await sdk.haptics.selectionChanged();
    }

    setActiveTab(tab);
    setShowTabMenu(false);
    if (tab === "wallet") {
      setCurrentWalletPage("list");
    }
  };

  const handleWalletActionSelect = async (walletActionId: WalletPageType) => {
    // Add haptic feedback for wallet action selection
    try {
      await sdk.haptics.selectionChanged();
    } catch (error) {
      console.log("Haptics not supported:", error);
    }

    setCurrentWalletPage(walletActionId);
  };

  const handleBackToWalletList = async () => {
    // Add haptic feedback for back navigation
    try {
      await sdk.haptics.impactOccurred("light");
    } catch (error) {
      console.log("Haptics not supported:", error);
    }

    setCurrentWalletPage("list");
  };

  const handleListTypeChange = async (newListType: ListType) => {
    // Add haptic feedback for list type change
    try {
      await sdk.haptics.selectionChanged();
    } catch (error) {
      console.log("Haptics not supported:", error);
    }

    setListType(newListType);
  };

  // Get the current cards based on selected filter
  const getCurrentCards = (): CardData[] => {
    switch (listType) {
      case "NEW":
        return newCards;
      case "MOST_VALUABLE":
        return valuableCards;
      case "TOP_GAINERS":
        return gainersCards;
      case "FEATURED":
        return featuredCards;
      default:
        return featuredCards;
    }
  };

  // Update swipe progress when cards are swiped
  const handleSwipeProgress = (currentIndex: number) => {
    setSwipeProgress((prev) => ({
      ...prev,
      [listType]: currentIndex,
    }));
  };

  // Initialize swipe progress when data loads
  useEffect(() => {
    if (!isInitialLoading) {
      setSwipeProgress({
        NEW: newCards.length - 1,
        MOST_VALUABLE: valuableCards.length - 1,
        TOP_GAINERS: gainersCards.length - 1,
        FEATURED: featuredCards.length - 1,
      });
    }
  }, [
    isInitialLoading,
    newCards.length,
    valuableCards.length,
    gainersCards.length,
    featuredCards.length,
  ]);

  return (
    <div
      style={{
        marginTop:
          (frameContext?.context as any)?.client?.safeAreaInsets?.top ?? 0,
        marginBottom:
          (frameContext?.context as any)?.client?.safeAreaInsets?.bottom ?? 0,
        marginLeft:
          (frameContext?.context as any)?.client?.safeAreaInsets?.left ?? 0,
        marginRight:
          (frameContext?.context as any)?.client?.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[95%] max-w-lg mx-auto py-4 px-4">
        <div className="mb-6 mt-3 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/base-logo.png" alt="Base" className="h-8 object-contain" />

          <div className="flex items-center gap-3">
            {/* Tab Navigation Menu Icon */}
            <div className="relative tab-menu-container">
              <button
                onClick={() => setShowTabMenu(!showTabMenu)}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>

              {/* Dropdown Menu for Tab Navigation */}
              {showTabMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => handleTabChange("swipe")}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                        activeTab === "swipe" ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="text-xl">🔄</span>
                      <div>
                        <div className="font-medium text-sm">Swipe</div>
                        <div className="text-xs text-muted-foreground">
                          Discover tokens
                        </div>
                      </div>
                      {activeTab === "swipe" && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleTabChange("wallet")}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                        activeTab === "wallet" ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="text-xl">👛</span>
                      <div>
                        <div className="font-medium text-sm">Wallet</div>
                        <div className="text-xs text-muted-foreground">
                          Manage wallet
                        </div>
                      </div>
                      {activeTab === "wallet" && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleTabChange("buylist")}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                        activeTab === "buylist" ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="text-xl">🛒</span>
                      <div>
                        <div className="font-medium text-sm">Buy List</div>
                        <div className="text-xs text-muted-foreground">
                          Your selections
                        </div>
                      </div>
                      {activeTab === "buylist" && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile picture - only show if context data is available */}
            {frameContext?.context &&
              (frameContext.context as any)?.user?.pfpUrl && (
                <button
                  onClick={() =>
                    sdk.actions.viewProfile({
                      fid: (frameContext.context as any).user.fid,
                    })
                  }
                  className="flex-shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(frameContext.context as any).user.pfpUrl}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </button>
              )}
          </div>
        </div>

        {activeTab === "swipe" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Discover & Buy
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Swipe right to buy, left to pass • Live from Zora
              </p>

              {/* List Type Toggle */}
              {!isInitialLoading && (
                <div className="flex gap-2 p-1 bg-white border border-border rounded-lg">
                  <button
                    onClick={() => handleListTypeChange("FEATURED")}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                      listType === "FEATURED"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                    }`}
                  >
                    ⭐ Featured
                  </button>
                  <button
                    onClick={() => handleListTypeChange("MOST_VALUABLE")}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                      listType === "MOST_VALUABLE"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                    }`}
                  >
                    💎 Valuable
                  </button>
                  <button
                    onClick={() => handleListTypeChange("TOP_GAINERS")}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                      listType === "TOP_GAINERS"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                    }`}
                  >
                    📈 Gainers
                  </button>
                </div>
              )}
            </div>

            {/* Initial Loading State */}
            {isInitialLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="text-4xl mb-2">⏳</div>
                  <p className="text-sm text-muted-foreground">
                    Loading tokens...
                  </p>
                </div>
              </div>
            ) : (
              /* Swipe Cards */
              <SwipeCards
                key={listType}
                cards={
                  getCurrentCards().length > 0 ? getCurrentCards() : undefined
                }
                initialIndex={swipeProgress[listType]}
                onBuy={handleBuy}
                onPass={handlePass}
                onIndexChange={handleSwipeProgress}
              />
            )}
          </div>
        )}

        {activeTab === "buylist" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your Buy List
              </h2>
              <p className="text-sm text-muted-foreground">
                Items you swiped right on
              </p>
            </div>

            {buyList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No items yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start swiping to add items to your buy list!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...buyList].reverse().map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="bg-white border border-border rounded-xl p-4 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex gap-4">
                      <div
                        className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${item.imageUrl})` }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {buyList.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-900">
                    Total Items:
                  </span>
                  <span className="text-blue-900">{buyList.length}</span>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Go to the Wallet tab to connect and complete your purchases
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="space-y-4">
            {!isConnected ? (
              <div className="text-center py-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Connect your wallet to access all features
                  </p>
                </div>
                <WalletConnect />
              </div>
            ) : (
              <div>
                {currentWalletPage === "list" ? (
                  <div className="space-y-4">
                    {/* Connection Status */}
                    <WalletConnect />

                    {/* Wallet Action Cells */}
                    <div className="space-y-2">
                      {walletActionDefinitions.map((walletAction) => (
                        <button
                          key={walletAction.id}
                          onClick={() =>
                            handleWalletActionSelect(walletAction.id)
                          }
                          className="w-full px-4 py-3 text-left bg-white border border-border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                        >
                          <div>
                            <h3 className="font-normal text-foreground">
                              {walletAction.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {walletAction.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={handleBackToWalletList}
                        className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <span className="text-muted-foreground">←</span>
                      </button>
                      <h2 className="font-semibold text-foreground">
                        {
                          walletActionDefinitions.find(
                            (a) => a.id === currentWalletPage
                          )?.name
                        }
                      </h2>
                    </div>
                    <div className="border border-border rounded-lg p-4 bg-white">
                      {(() => {
                        const walletAction = walletActionDefinitions.find(
                          (a) => a.id === currentWalletPage
                        );
                        if (walletAction) {
                          const Component = walletAction.component;
                          return <Component />;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
