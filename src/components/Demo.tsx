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
  const [zoraCards, setZoraCards] = useState<CardData[]>([]);

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

  // Fetch Zora data on mount
  useEffect(() => {
    const getZoraData = async () => {
      const data = await fetchZoraExplore();
      if (data) {
        const cards = transformZoraToCards(data);
        setZoraCards(cards);
      }
    };
    getZoraData();
  }, []);

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

        <div className="mb-6 mt-4">
          <div className="flex gap-2 p-1 bg-white border border-border rounded-lg">
            <button
              onClick={() => handleTabChange("swipe")}
              className={`flex-1 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                activeTab === "swipe"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              Swipe
            </button>
            <button
              onClick={() => handleTabChange("wallet")}
              className={`flex-1 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                activeTab === "wallet"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => handleTabChange("buylist")}
              className={`flex-1 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                activeTab === "buylist"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              Buy List
            </button>
          </div>
        </div>

        {activeTab === "swipe" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Discover & Buy
              </h2>
              <p className="text-sm text-muted-foreground">
                {zoraCards.length > 0
                  ? "Swipe right to buy, left to pass • Live from Zora"
                  : "Loading tokens from Zora..."}
              </p>
            </div>

            {/* Swipe Cards */}
            <SwipeCards
              cards={zoraCards.length > 0 ? zoraCards : undefined}
              onBuy={handleBuy}
              onPass={handlePass}
            />
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">
                            {item.name}
                          </h3>
                          <span className="text-green-600 font-bold">
                            {item.price}
                          </span>
                        </div>
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
