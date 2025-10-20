/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useFrameContext } from "~/components/providers/FrameProvider";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  useAccount,
  useReadContract,
  useWalletClient,
  usePublicClient,
  useBalance,
} from "wagmi";
import { useWeb3Auth } from "@web3auth/modal/react";
import { WalletConnect } from "~/components/wallet/WalletActions";
import SwipeCards from "~/components/SwipeCards";
import { CardData } from "~/data/dummyCards";
import {
  fetchZoraExplore,
  transformZoraToCards,
  ListType,
} from "~/components/wallet/test";
import LoginPromptModal from "~/components/LoginPromptModal";
import SetAmountModal from "~/components/SetAmountModal";
import Toast from "~/components/Toast";
import {
  USDC_CONTRACT,
  ERC20_ABI,
  checkSufficientBalance,
  formatUSDCBalance,
} from "~/lib/swapTokens";
import { tradeCoin, type TradeParameters } from "@zoralabs/coins-sdk";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import { Wallet, TrendingUp, Layers } from "lucide-react";

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
  const { address, isConnected } = useAccount();
  const { status, provider } = useWeb3Auth();
  const isWeb3AuthConnected = status === "connected";
  const [activeTab, setActiveTab] = useState<TabType>("swipe");
  const [currentWalletPage, setCurrentWalletPage] =
    useState<WalletPageType>("list");
  const [capabilities, setCapabilities] = useState<any>(null);
  const [buyList, setBuyList] = useState<CardData[]>([]);
  const [allCards, setAllCards] = useState<CardData[]>([]); // Unified card deck
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showTabMenu, setShowTabMenu] = useState(false);
  const [web3AuthAddress, setWeb3AuthAddress] = useState<string | null>(null);

  // Login and amount setting modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [usdcAmountPerSwipe, setUsdcAmountPerSwipe] = useState<string>("0.1");
  const [pendingBuyCard, setPendingBuyCard] = useState<CardData | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success"
  );
  const [showToast, setShowToast] = useState(false);

  const { data: wagmiWalletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [customWalletClient, setCustomWalletClient] = useState<any>(null);

  // Get Web3Auth wallet address and create wallet client
  useEffect(() => {
    const getAddress = async () => {
      if (isWeb3AuthConnected && provider) {
        try {
          const accounts = await provider.request({ method: "eth_accounts" });
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            const accountAddress = accounts[0] as `0x${string}`;
            setWeb3AuthAddress(accountAddress);

            // Create wallet client from Web3Auth provider
            const walletClient = createWalletClient({
              account: accountAddress,
              chain: base,
              transport: custom(provider),
            });
            setCustomWalletClient(walletClient);
          }
        } catch (error) {
          console.error("Failed to get address:", error);
        }
      } else {
        setWeb3AuthAddress(null);
        setCustomWalletClient(null);
      }
    };
    getAddress();
  }, [isWeb3AuthConnected, provider]);

  // Use Web3Auth address if available, otherwise fallback
  const userAddress = (web3AuthAddress || address) as `0x${string}` | undefined;

  // Load USDC amount from localStorage on mount
  useEffect(() => {
    const savedAmount = localStorage.getItem("usdcAmountPerSwipe");
    if (savedAmount) {
      setUsdcAmountPerSwipe(savedAmount);
    }
  }, []);

  // Save USDC amount to localStorage
  const saveUsdcAmount = (amount: string) => {
    setUsdcAmountPerSwipe(amount);
    localStorage.setItem("usdcAmountPerSwipe", amount);
    console.log(`💰 Saved USDC amount: ${amount}`);
  };

  // Show toast notification
  const showToastNotification = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Fetch USDC balance
  const { data: usdcBalanceData } = useReadContract({
    address: USDC_CONTRACT,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    chainId: 8453, // Base Mainnet
  });

  const usdcBalance = usdcBalanceData as bigint | undefined;

  // Fetch ETH balance for gas fees
  const { data: ethBalance } = useBalance({
    address: userAddress,
    chainId: 8453,
  });

  const handleBuy = async (card: CardData) => {
    // Check if user is logged in FIRST
    if (!isWeb3AuthConnected || !userAddress) {
      console.log("⚠️ User not logged in, showing login prompt");
      setPendingBuyCard(card); // Save the card they tried to buy
      setShowLoginModal(true);
      // Restore the card by incrementing the index back
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Check if amount is set
    const hasSetAmount = localStorage.getItem("usdcAmountPerSwipe");
    if (!hasSetAmount) {
      console.log("💰 Amount not set, showing amount modal");
      setPendingBuyCard(card);
      setShowAmountModal(true);
      // Restore the card by incrementing the index back
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Proceed with the buy
    await executeBuy(card);
  };

  const executeBuy = async (card: CardData) => {
    setBuyList((prev) => [...prev, card]);
    console.log("Added to buy list:", card);

    // Safety check
    if (!isWeb3AuthConnected || !userAddress) {
      console.log("⚠️ Wallet not connected");
      return;
    }

    // Check if user has enough ETH for gas (need at least 0.0002 ETH for safe margin)
    const minEthForGas = 200000000000000n; // 0.0002 ETH in wei
    if (!ethBalance || ethBalance.value < minEthForGas) {
      const currentEth = ethBalance
        ? (Number(ethBalance.value) / 1e18).toFixed(6)
        : "0";
      console.log(
        `⚠️ Insufficient ETH for gas. Have: ${currentEth} ETH, Need: ~0.0002 ETH`
      );
      alert(
        `⚠️ Insufficient ETH for Gas Fees!\n\n` +
          `You have: ${currentEth} ETH\n` +
          `You need: ~0.0002 ETH (minimum)\n\n` +
          `Please add some ETH to your wallet on Base chain.\n` +
          `Your address: ${userAddress}`
      );
      return;
    }

    if (!checkSufficientBalance(usdcBalance, usdcAmountPerSwipe)) {
      console.log(
        `⚠️ Insufficient USDC balance. Have: ${formatUSDCBalance(
          usdcBalance
        )} USDC, Need: ${usdcAmountPerSwipe} USDC`
      );
      alert(
        `⚠️ Insufficient USDC!\n\nYou have: ${formatUSDCBalance(
          usdcBalance
        )} USDC\nYou need: ${usdcAmountPerSwipe} USDC`
      );
      return;
    }

    if (!card.coinData?.address) {
      console.log("⚠️ Token address not available");
      return;
    }

    // Use custom wallet client for Web3Auth, otherwise use wagmi wallet client
    const activeWalletClient = customWalletClient || wagmiWalletClient;

    // Check if we have the necessary clients
    if (!activeWalletClient || !publicClient) {
      console.log("⚠️ Wallet client or public client not available");
      console.log("Custom wallet client:", customWalletClient);
      console.log("Wagmi wallet client:", wagmiWalletClient);
      console.log("Public client:", publicClient);
      return;
    }

    try {
      console.log(
        `🔄 Starting purchase: ${usdcAmountPerSwipe} USDC → ${card.name}`
      );
      console.log("Using wallet client:", activeWalletClient);

      // Set up trade parameters using Zora Coins SDK
      const tradeParameters: TradeParameters = {
        sell: {
          type: "erc20",
          address: USDC_CONTRACT, // USDC address on Base
        },
        buy: {
          type: "erc20",
          address: card.coinData.address as `0x${string}`, // Creator Coin address
        },
        amountIn: BigInt(parseFloat(usdcAmountPerSwipe) * 10 ** 6), // USDC amount (6 decimals)
        slippage: 0.05, // 5% slippage
        sender: userAddress,
      };

      console.log("💱 Executing trade via Zora Coins SDK...");

      // Execute the trade using Zora Coins SDK
      const receipt = await tradeCoin({
        tradeParameters,
        walletClient: activeWalletClient,
        account: userAddress,
        publicClient,
      });

      console.log(`✅ Successfully purchased ${card.name}!`);
      console.log("Transaction receipt:", receipt);

      // Show success toast
      showToastNotification("Transaction finalized", "success");

      // Trigger haptic feedback for success
      try {
        await sdk.haptics.notificationOccurred("success");
      } catch (error) {
        console.log("Haptics not supported:", error);
      }
    } catch (error) {
      console.error("❌ Purchase failed:", error);

      // Show error toast
      showToastNotification("Transaction failed", "error");

      // Trigger haptic feedback for error
      try {
        await sdk.haptics.notificationOccurred("error");
      } catch (err) {
        console.log("Haptics not supported:", err);
      }
    }
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

  // Helper function to shuffle cards randomly
  const shuffleCards = (cards: CardData[]): CardData[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load all 60 cards upfront (FEATURED, TOP_GAINERS, NEW), then scramble them
  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsInitialLoading(true);

        // Load all three categories in parallel
        console.log(
          "🎬 Loading all cards from FEATURED, TOP_GAINERS, and NEW..."
        );
        const categories: ListType[] = ["FEATURED", "TOP_GAINERS", "NEW"];

        const allCardPromises = categories.map(async (category) => {
          try {
            console.log(`📥 Loading ${category} cards...`);
            const data = await fetchZoraExplore(category);

            if (data && data.exploreList?.edges) {
              const cards = transformZoraToCards(data);

              if (cards && cards.length > 0) {
                const taggedCards = cards.map((card) => ({
                  ...card,
                  category: category,
                }));
                console.log(`✅ Loaded ${cards.length} ${category} cards`);
                return taggedCards;
              }
            }
            return [];
          } catch (error) {
            console.error(`Error loading ${category}:`, error);
            return [];
          }
        });

        // Wait for all categories to load
        const cardArrays = await Promise.all(allCardPromises);
        const allLoadedCards = cardArrays.flat();

        console.log(`📦 Total cards loaded: ${allLoadedCards.length}`);

        // Scramble all cards randomly
        const scrambledCards = shuffleCards(allLoadedCards);
        console.log(`🔀 Cards scrambled randomly`);

        setAllCards(scrambledCards);
        setCurrentIndex(scrambledCards.length - 1);
        setIsInitialLoading(false);

        console.log(
          `🎉 All ${scrambledCards.length} cards loaded and ready to swipe!`
        );
      } catch (error) {
        console.error("Error loading cards:", error);
        setIsInitialLoading(false);
      }
    };

    loadCards();
  }, []);

  // Refresh cards function
  const handleRefreshCards = async () => {
    setIsInitialLoading(true);

    // Reload and scramble cards
    try {
      console.log("🔄 Refreshing cards...");
      const categories: ListType[] = ["FEATURED", "TOP_GAINERS", "NEW"];

      const allCardPromises = categories.map(async (category) => {
        try {
          console.log(`📥 Reloading ${category} cards...`);
          const data = await fetchZoraExplore(category);

          if (data && data.exploreList?.edges) {
            const cards = transformZoraToCards(data);

            if (cards && cards.length > 0) {
              const taggedCards = cards.map((card) => ({
                ...card,
                category: category,
              }));
              console.log(`✅ Reloaded ${cards.length} ${category} cards`);
              return taggedCards;
            }
          }
          return [];
        } catch (error) {
          console.error(`Error reloading ${category}:`, error);
          return [];
        }
      });

      const cardArrays = await Promise.all(allCardPromises);
      const allLoadedCards = cardArrays.flat();

      const scrambledCards = shuffleCards(allLoadedCards);
      console.log(`🔀 Cards reshuffled randomly`);

      setAllCards(scrambledCards);
      setCurrentIndex(scrambledCards.length - 1);
      setIsInitialLoading(false);

      console.log(`🎉 Refreshed ${scrambledCards.length} cards!`);

      // Trigger haptic feedback
      try {
        await sdk.haptics.notificationOccurred("success");
      } catch (error) {
        console.log("Haptics not supported:", error);
      }
    } catch (error) {
      console.error("Error refreshing cards:", error);
      setIsInitialLoading(false);
    }
  };

  // No progressive loading - all cards loaded upfront

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

  const walletActionDefinitions: WalletActionDefinition[] = [];

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

  // Update current index as user swipes
  const handleSwipeProgress = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle login from modal
  const handleLoginFromModal = () => {
    setShowLoginModal(false);
    setActiveTab("wallet");
    console.log("🔐 Redirecting to wallet tab for login");
  };

  // Handle amount set
  const handleSetAmount = (amount: string) => {
    saveUsdcAmount(amount);
    setShowAmountModal(false);

    // If there was a pending card, switch back to swipe tab so user can swipe again
    if (pendingBuyCard) {
      console.log("💳 Amount set! Returning to swipe tab");
      setActiveTab("swipe");
      setPendingBuyCard(null);

      // Show a brief haptic feedback
      try {
        sdk.haptics.notificationOccurred("success");
      } catch (error) {
        console.log("Haptics not supported:", error);
      }
    }
  };

  // Check if user just logged in and needs to set amount
  useEffect(() => {
    if (isWeb3AuthConnected) {
      const hasSetAmount = localStorage.getItem("usdcAmountPerSwipe");
      if (!hasSetAmount) {
        console.log("🎉 User just logged in, showing amount modal");
        setTimeout(() => {
          setShowAmountModal(true);
        }, 500); // Small delay to ensure smooth transition
      }
    }
  }, [isWeb3AuthConnected]);

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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-lg z-[9999] overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => handleTabChange("swipe")}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                        activeTab === "swipe" ? "bg-blue-50" : ""
                      }`}
                    >
                      <Layers className="w-5 h-5 text-gray-700" />
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
                      <Wallet className="w-5 h-5 text-gray-700" />
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
                      <TrendingUp className="w-5 h-5 text-gray-700" />
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
              <p className="text-sm text-muted-foreground mb-4">
                Swipe right to buy, left to pass • Live from Zora
              </p>
            </div>

            {/* Initial Loading State */}
            {isInitialLoading ? (
              <div className="flex justify-center items-center">
                <div
                  className="relative w-full max-w-sm mx-auto"
                  style={{ height: "550px" }}
                >
                  {/* Animated Loading Cards */}
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl"
                      style={{
                        height: "500px",
                        animation: `cardSwirl ${
                          2 + i * 0.5
                        }s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`,
                        opacity: 1 - i * 0.15,
                        top: `${i * 8}px`,
                      }}
                    >
                      <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                        {/* Skeleton Content */}
                        <div className="w-full space-y-6">
                          {/* Image skeleton */}
                          <div className="w-32 h-32 mx-auto rounded-full bg-gray-300 animate-pulse" />

                          {/* Title skeleton */}
                          <div className="space-y-3">
                            <div className="h-6 bg-gray-300 rounded-lg w-3/4 mx-auto animate-pulse" />
                            <div className="h-4 bg-gray-300 rounded-lg w-full animate-pulse" />
                            <div className="h-4 bg-gray-300 rounded-lg w-5/6 mx-auto animate-pulse" />
                          </div>

                          {/* Details skeleton */}
                          <div className="pt-8 space-y-2">
                            <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto animate-pulse" />
                            <div className="h-3 bg-gray-300 rounded w-2/3 mx-auto animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading Text */}
                  <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Loading 60 tokens...
                    </p>
                  </div>
                </div>

                <style jsx>{`
                  @keyframes cardSwirl {
                    0% {
                      transform: translateY(0) rotate(0deg) scale(1);
                    }
                    25% {
                      transform: translateY(-10px) rotate(3deg) scale(1.01);
                    }
                    50% {
                      transform: translateY(0) rotate(0deg) scale(1);
                    }
                    75% {
                      transform: translateY(-10px) rotate(-3deg) scale(1.01);
                    }
                    100% {
                      transform: translateY(0) rotate(0deg) scale(1);
                    }
                  }
                `}</style>
              </div>
            ) : (
              <div>
                {/* Swipe Cards */}
                <SwipeCards
                  cards={allCards.length > 0 ? allCards : undefined}
                  initialIndex={allCards.length - 1}
                  onBuy={handleBuy}
                  onPass={handlePass}
                  onIndexChange={handleSwipeProgress}
                  onRefreshCards={handleRefreshCards}
                  onViewBuyList={() => setActiveTab("buylist")}
                  totalCardsCount={allCards.length}
                />
              </div>
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
            {!isConnected && !isWeb3AuthConnected ? (
              <div className="py-8">
                <WalletConnect />
              </div>
            ) : (
              <div>
                {currentWalletPage === "list" ? (
                  <div className="space-y-4">
                    {/* Connection Status */}
                    <WalletConnect
                      usdcAmountPerSwipe={usdcAmountPerSwipe}
                      onChangeAmount={() => setShowAmountModal(true)}
                    />

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

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginFromModal}
      />

      {/* Set Amount Modal */}
      <SetAmountModal
        isOpen={showAmountModal}
        onClose={() => {
          setShowAmountModal(false);
          setPendingBuyCard(null); // Clear pending card if user cancels
        }}
        onSetAmount={handleSetAmount}
        currentAmount={usdcAmountPerSwipe}
        isFirstTime={!localStorage.getItem("usdcAmountPerSwipe")}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
}
