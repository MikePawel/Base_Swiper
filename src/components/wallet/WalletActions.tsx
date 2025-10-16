"use client";

import React, { useState, useCallback } from "react";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
  useBalance,
  useReadContract,
  useConnect,
} from "wagmi";
import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { BaseError, UserRejectedRequestError, formatUnits } from "viem";

import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import { SiweMessage } from "siwe";
import { setApiKey } from "@zoralabs/coins-sdk";

// Set up your API key before making any SDK requests
if (process.env.NEXT_PUBLIC_ZORA_API_KEY) {
  setApiKey(process.env.NEXT_PUBLIC_ZORA_API_KEY);
}

// dylsteck.base.eth
const RECIPIENT_ADDRESS = "0x8342A48694A74044116F330db5050a267b28dD85";

// USDC contract on Base Mainnet
const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

const renderError = (error: Error | null): React.ReactElement | null => {
  if (!error) return null;
  if (error instanceof BaseError) {
    const isUserRejection = error.walk(
      (e) => e instanceof UserRejectedRequestError
    );

    if (isUserRejection) {
      return <div className="text-red-500 text-xs mt-1">Rejected by user.</div>;
    }
  }

  return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
};

export function WalletConnect() {
  const { address, chain } = useAccount();
  const chainId = useChainId();
  const { web3Auth, status, provider } = useWeb3Auth();
  const { connect: web3AuthConnect, loading: isConnecting } =
    useWeb3AuthConnect();
  const { disconnect: web3AuthDisconnect } = useWeb3AuthDisconnect();
  const [web3AuthAddress, setWeb3AuthAddress] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const isWeb3AuthConnected = status === "connected";

  // Get Web3Auth wallet address
  React.useEffect(() => {
    const getWeb3AuthAddress = async () => {
      if (isWeb3AuthConnected && provider) {
        try {
          const accounts = await provider.request({ method: "eth_accounts" });
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            setWeb3AuthAddress(accounts[0] as string);
          }
        } catch (error) {
          console.error("Failed to get Web3Auth address:", error);
        }
      } else {
        setWeb3AuthAddress(null);
        setPrivateKey(null);
        setShowPrivateKey(false);
      }
    };
    getWeb3AuthAddress();
  }, [isWeb3AuthConnected, provider]);

  // Get private key when requested
  const handleShowPrivateKey = async () => {
    if (!showPrivateKey && provider && web3Auth) {
      try {
        // Web3Auth uses "private_key" method, not "eth_private_key"
        const privateKey = await provider.request({
          method: "private_key",
        });
        setPrivateKey(privateKey as string);
        setShowPrivateKey(true);
      } catch (error) {
        console.error("Failed to get private key:", error);
        alert("Failed to retrieve private key. Please try again.");
      }
    } else {
      setShowPrivateKey(!showPrivateKey);
    }
  };

  // Copy to clipboard
  const handleCopyPrivateKey = async () => {
    if (privateKey) {
      try {
        await navigator.clipboard.writeText(privateKey);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  // Use Web3Auth address if available, otherwise use wagmi address
  const displayAddress = (web3AuthAddress || address) as
    | `0x${string}`
    | undefined;

  // Fetch ETH balance
  const { data: ethBalance } = useBalance({
    address: displayAddress,
    chainId: chainId,
  });

  // Fetch USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_CONTRACT,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: displayAddress ? [displayAddress] : undefined,
    chainId: chainId,
  });

  const handleWeb3AuthConnect = async () => {
    try {
      await web3AuthConnect();
    } catch (error) {
      console.error("Web3Auth connection failed:", error);
    }
  };

  const handleWeb3AuthDisconnect = async () => {
    try {
      await web3AuthDisconnect();
    } catch (error) {
      console.error("Web3Auth disconnect failed:", error);
    }
  };

  // Format USDC balance (6 decimals)
  const formattedUsdcBalance = usdcBalance
    ? formatUnits(usdcBalance as bigint, 6)
    : "0";

  // Format ETH balance
  const formattedEthBalance = ethBalance
    ? parseFloat(ethBalance.formatted).toFixed(4)
    : "0";

  return (
    <>
      {/* Show connection options only when NOT connected */}
      {!isWeb3AuthConnected && (
        <div className="space-y-3">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Connect Wallet
            </h2>
            <p className="text-sm text-gray-500">Connect to get started</p>
          </div>

          <Button
            onClick={handleWeb3AuthConnect}
            disabled={isConnecting}
            isLoading={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      )}

      {/* Web3Auth Wallet Info Display - Only shown when connected */}
      {isWeb3AuthConnected && displayAddress && (
        <div className="space-y-4">
          {/* Disconnect Button at Top */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Connected
              </span>
            </div>
            <button
              onClick={handleWeb3AuthDisconnect}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>

          {/* Wallet Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            {/* Chain Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Network
              </span>
              <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                {chain?.name || "Base"}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Address
              </span>
              <div className="font-mono text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded border border-gray-200 break-all">
                {displayAddress}
              </div>
              <a
                href={`https://basescan.org/address/${displayAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 gap-1"
              >
                View on BaseScan
                <span>→</span>
              </a>
            </div>

            {/* Balances */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Balances
              </span>

              {/* ETH Balance */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    Ξ
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">ETH</div>
                    <div className="text-xs text-gray-500">Ethereum</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-semibold text-gray-900">
                    {formattedEthBalance}
                  </div>
                </div>
              </div>

              {/* USDC Balance */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    $
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      USDC
                    </div>
                    <div className="text-xs text-gray-500">USD Coin</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-semibold text-gray-900">
                    ${parseFloat(formattedUsdcBalance).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Private Key Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Export Wallet
              </span>
              <span className="text-xs text-gray-400">Advanced</span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Export your private key to use this wallet in other apps. Keep it
              secure.
            </p>

            <Button
              onClick={handleShowPrivateKey}
              className="w-full bg-gray-900 hover:bg-black text-white text-sm py-2.5"
            >
              {showPrivateKey ? "Hide Private Key" : "Show Private Key"}
            </Button>

            {showPrivateKey && privateKey && (
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="font-mono text-xs text-gray-300 break-all leading-relaxed">
                    {privateKey}
                  </div>
                </div>

                <Button
                  onClick={handleCopyPrivateKey}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm py-2"
                >
                  {copySuccess ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function SignMessage() {
  const { isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const {
    signMessage,
    data: signature,
    error: signError,
    isError: isSignError,
    isPending: isSignPending,
  } = useSignMessage();

  const handleSignMessage = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      await connectAsync({
        chainId: base.id,
        connector: config.connectors[0],
      });
    }

    signMessage({ message: "Hello from Frames v2!" });
  }, [connectAsync, isConnected, signMessage]);

  return (
    <>
      <Button
        onClick={handleSignMessage}
        disabled={isSignPending}
        isLoading={isSignPending}
      >
        Sign Message
      </Button>
      {isSignError && renderError(signError)}
      {signature && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div className="text-gray-600 mb-1">Response</div>
          <div className="text-green-600 font-mono break-all">{signature}</div>
        </div>
      )}
    </>
  );
}

export function SignSiweMessage() {
  const { address, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const chainId = useChainId();
  const {
    signMessage,
    data: signature,
    error: signError,
    isError: isSignError,
    isPending: isSignPending,
  } = useSignMessage();

  const handleSignSiweMessage = useCallback(async (): Promise<void> => {
    if (!isConnected || !address) {
      await connectAsync({
        chainId: base.id,
        connector: config.connectors[0],
      });
      return;
    }

    const siweMessage = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in with Ethereum to the app.",
      uri: window.location.origin,
      version: "1",
      chainId: chainId || base.id,
      nonce: Math.random().toString(36).substring(2, 15),
    });

    signMessage({ message: siweMessage.prepareMessage() });
  }, [connectAsync, isConnected, address, chainId, signMessage]);

  return (
    <>
      <Button
        onClick={handleSignSiweMessage}
        disabled={isSignPending}
        isLoading={isSignPending}
      >
        Sign Message (SIWE)
      </Button>
      {isSignError && renderError(signError)}
      {signature && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div className="text-gray-600 mb-1">Response</div>
          <div className="text-green-600 font-mono break-all">{signature}</div>
        </div>
      )}
    </>
  );
}

export function SendEth() {
  const { isConnected, chainId } = useAccount();
  const {
    sendTransaction,
    data,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const handleSend = useCallback((): void => {
    sendTransaction({
      to: RECIPIENT_ADDRESS,
      value: 1n,
    });
  }, [sendTransaction]);

  return (
    <>
      <Button
        onClick={handleSend}
        disabled={!isConnected || isSendTxPending}
        isLoading={isSendTxPending}
      >
        Send Transaction (ETH)
      </Button>
      {isSendTxError && renderError(sendTxError)}
      {data && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div className="text-gray-600 mb-1">Response</div>
          <div className="text-green-600 font-mono break-all">
            Hash: {truncateAddress(data)}
          </div>
          <div className="text-green-600 font-mono">
            Status:{" "}
            {isConfirming
              ? "Confirming..."
              : isConfirmed
              ? "Confirmed!"
              : "Pending"}
          </div>
        </div>
      )}
    </>
  );
}

export function SignTypedData() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const {
    signTypedData,
    error: signTypedError,
    isError: isSignTypedError,
    isPending: isSignTypedPending,
  } = useSignTypedData();

  const signTyped = useCallback((): void => {
    signTypedData({
      domain: {
        name: "Frames v2 Demo",
        version: "1",
        chainId,
      },
      types: {
        Message: [{ name: "content", type: "string" }],
      },
      message: {
        content: "Hello from Frames v2!",
      },
      primaryType: "Message",
    });
  }, [chainId, signTypedData]);

  return (
    <>
      <Button
        onClick={signTyped}
        disabled={!isConnected || isSignTypedPending}
        isLoading={isSignTypedPending}
      >
        Sign Typed Data
      </Button>
      {isSignTypedError && renderError(signTypedError)}
    </>
  );
}

export function SwitchChain() {
  const chainId = useChainId();
  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
    isPending: isSwitchChainPending,
  } = useSwitchChain();

  const handleSwitchChain = useCallback((): void => {
    switchChain({ chainId: chainId === base.id ? optimism.id : base.id });
  }, [switchChain, chainId]);

  return (
    <>
      <Button
        onClick={handleSwitchChain}
        disabled={isSwitchChainPending}
        isLoading={isSwitchChainPending}
      >
        Switch to {chainId === base.id ? "Optimism" : "Base"}
      </Button>
      {isSwitchChainError && renderError(switchChainError)}
    </>
  );
}

export function SendTransaction() {
  const { isConnected } = useAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  const sendTx = useCallback((): void => {
    sendTransaction(
      {
        to: RECIPIENT_ADDRESS as `0x${string}`,
        data: "0x9846cd9efc000023c0",
      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);
        },
      }
    );
  }, [sendTransaction]);

  return (
    <>
      <Button
        onClick={sendTx}
        disabled={!isConnected || isSendTxPending}
        isLoading={isSendTxPending}
      >
        Send Transaction (Contract)
      </Button>
      {isSendTxError && renderError(sendTxError)}
      {txHash && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div className="text-gray-600 mb-1">Response</div>
          <div className="text-green-600 font-mono break-all">
            Hash: {truncateAddress(txHash)}
          </div>
          <div className="text-green-600 font-mono">
            Status:{" "}
            {isConfirming
              ? "Confirming..."
              : isConfirmed
              ? "Confirmed!"
              : "Pending"}
          </div>
        </div>
      )}
    </>
  );
}
