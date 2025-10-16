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
import {
  USDC_CONTRACT,
  ERC20_ABI,
  checkSufficientBalance,
  formatUSDCBalance,
} from "~/lib/swapTokens";
import { tradeCoin, type TradeParameters } from "@zoralabs/coins-sdk";
import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";

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

  // Track loading sequence: FEATURED -> MOST_VALUABLE -> TOP_GAINERS -> NEW (4 STEPS!)
  const [loadingStep, setLoadingStep] = useState(0);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const [showAllDoneMessage, setShowAllDoneMessage] = useState(false);
  const [hasTriedLoadingNew, setHasTriedLoadingNew] = useState(false);

  // Track which categories have been loaded to prevent duplicates
  const [loadedCategories, setLoadedCategories] = useState<Set<string>>(
    new Set()
  );

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
    setBuyList((prev) => [...prev, card]);
    console.log("Added to buy list:", card);

    // Check if Web3Auth is connected and has sufficient USDC
    if (!isWeb3AuthConnected || !userAddress) {
      console.log("⚠️ Wallet not connected");
      alert("Please connect your Web3Auth wallet first!");
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

    if (!checkSufficientBalance(usdcBalance, "0.1")) {
      console.log(
        `⚠️ Insufficient USDC balance. Have: ${formatUSDCBalance(
          usdcBalance
        )} USDC, Need: 0.1 USDC`
      );
      alert(
        `⚠️ Insufficient USDC!\n\nYou have: ${formatUSDCBalance(
          usdcBalance
        )} USDC\nYou need: 0.1 USDC`
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
      console.log(`🔄 Starting purchase: 0.1 USDC → ${card.name}`);
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
        amountIn: BigInt(0.1 * 10 ** 6), // 0.1 USDC (6 decimals)
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

      // Trigger haptic feedback for success
      try {
        await sdk.haptics.notificationOccurred("success");
      } catch (error) {
        console.log("Haptics not supported:", error);
      }
    } catch (error) {
      console.error("❌ Purchase failed:", error);

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

  // Load initial batch of 20 Featured cards
  useEffect(() => {
    const loadInitialCards = async () => {
      setIsInitialLoading(true);

      console.log("🎬 STEP 0: Loading 20 FEATURED cards...");
      const featuredData = await fetchZoraExplore("FEATURED");

      if (featuredData) {
        const cards = transformZoraToCards(featuredData);
        setAllCards(cards);
        setCurrentIndex(cards.length - 1);
        setLoadedCategories(new Set(["FEATURED"]));
        setLoadingStep(1);
        console.log(
          `✅ Loaded ${cards.length} FEATURED cards | Total: ${cards.length}`
        );
      }

      setIsInitialLoading(false);
    };

    loadInitialCards();
  }, []);

  // Progressive loading based on sequence
  useEffect(() => {
    const loadNextBatch = async () => {
      if (isLoadingBatch || isInitialLoading) return;

      const remainingCards = currentIndex + 1;

      // Start loading next batch when ~5 cards remaining
      if (remainingCards <= 5 && remainingCards > 0) {
        let listType: ListType = "NEW";
        let categoryKey = "";

        // Determine what to load based on loading step
        // EXACT ORDER: FEATURED (step 0) -> MOST_VALUABLE (step 1) -> TOP_GAINERS (step 2) -> NEW (step 3)
        switch (loadingStep) {
          case 1:
            listType = "MOST_VALUABLE";
            categoryKey = "MOST_VALUABLE";
            break;

          case 2:
            listType = "TOP_GAINERS";
            categoryKey = "TOP_GAINERS";
            break;

          case 3:
            listType = "NEW";
            categoryKey = "NEW";
            setHasTriedLoadingNew(true);
            break;

          default:
            return;
        }

        // Check if we've already loaded this category (except NEW which can repeat)
        if (loadedCategories.has(categoryKey) && categoryKey !== "NEW") {
          console.log(`⚠️ ${categoryKey} already loaded, skipping...`);
          // Move to next step
          if (loadingStep < 3) {
            setLoadingStep(loadingStep + 1);
          }
          return;
        }

        setIsLoadingBatch(true);

        try {
          console.log(`📥 STEP ${loadingStep}: Loading ${categoryKey}...`);
          const data = await fetchZoraExplore(listType);
          let newCards: CardData[] = [];

          if (data) {
            newCards = transformZoraToCards(data);
          }

          if (newCards.length > 0) {
            setAllCards((prev) => [...prev, ...newCards]);
            setLoadedCategories((prev) => new Set([...prev, categoryKey]));
            console.log(
              `✅ Added ${newCards.length} ${categoryKey} cards | Total: ${
                allCards.length + newCards.length
              }`
            );

            // Only increment step if not at final step (NEW cards)
            if (loadingStep < 3) {
              setLoadingStep(loadingStep + 1);
            }
          } else if (loadingStep === 3) {
            // No more NEW cards available
            console.log("❌ No more NEW cards available");
          }
        } catch (error) {
          console.error(`❌ Error loading ${categoryKey}:`, error);
        } finally {
          setIsLoadingBatch(false);
        }
      }
    };

    loadNextBatch();
  }, [
    currentIndex,
    loadingStep,
    isLoadingBatch,
    isInitialLoading,
    allCards.length,
    loadedCategories,
  ]);

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

  // Detect when all cards are done (only after going through all phases)
  useEffect(() => {
    // Only show popup when:
    // 1. We've reached the NEW cards phase (step 3)
    // 2. We've tried loading NEW cards
    // 3. User has swiped through all cards (currentIndex < 0)
    // 4. We have loaded at least 60 cards (20 FEATURED + 20 MOST_VALUABLE + 20 TOP_GAINERS)
    // 5. Not currently in initial loading
    if (
      !isInitialLoading &&
      loadingStep === 3 &&
      hasTriedLoadingNew &&
      currentIndex < 0 &&
      allCards.length >= 60 &&
      !isLoadingBatch
    ) {
      setShowAllDoneMessage(true);
    }
  }, [
    currentIndex,
    isInitialLoading,
    allCards.length,
    loadingStep,
    hasTriedLoadingNew,
    isLoadingBatch,
  ]);

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
                      Loading amazing tokens...
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
              /* Swipe Cards - Infinite scroll */
              <SwipeCards
                cards={allCards.length > 0 ? allCards : undefined}
                initialIndex={currentIndex}
                onBuy={handleBuy}
                onPass={handlePass}
                onIndexChange={handleSwipeProgress}
              />
            )}

            {/* All Done Popup */}
            {showAllDoneMessage && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-scale-in">
                  <div className="mb-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      You&apos;re All Caught Up!
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      You&apos;ve swiped through all available tokens. Come back
                      in a bit for fresh new cards to discover!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowAllDoneMessage(false)}
                      className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      Got it!
                    </button>

                    <button
                      onClick={() => setActiveTab("buylist")}
                      className="w-full py-3 px-6 bg-gray-100 text-foreground rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      View Buy List
                    </button>
                  </div>
                </div>

                <style jsx>{`
                  @keyframes scale-in {
                    from {
                      opacity: 0;
                      transform: scale(0.9);
                    }
                    to {
                      opacity: 1;
                      transform: scale(1);
                    }
                  }

                  .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                  }
                `}</style>
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
