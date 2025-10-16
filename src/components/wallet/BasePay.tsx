"use client";

import { useState } from "react";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { Button } from "~/components/ui/Button";

interface PaymentState {
  status: "idle" | "processing" | "completed" | "pending" | "failed";
  message: string;
  transactionId?: string;
  timestamp?: Date;
}

function PaymentStatusCard({
  paymentState,
  onReset,
}: {
  paymentState: PaymentState;
  onReset: () => void;
}) {
  const getStatusConfig = (status: PaymentState["status"]) => {
    switch (status) {
      case "processing":
        return {
          icon: "⏳",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          titleColor: "text-blue-900",
          textColor: "text-blue-700",
        };
      case "pending":
        return {
          icon: "🔄",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconColor: "text-amber-600",
          titleColor: "text-amber-900",
          textColor: "text-amber-700",
        };
      case "completed":
        return {
          icon: "🎉",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-600",
          titleColor: "text-green-900",
          textColor: "text-green-700",
        };
      case "failed":
        return {
          icon: "❌",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          titleColor: "text-red-900",
          textColor: "text-red-700",
        };
      default:
        return {
          icon: "ℹ️",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-600",
          titleColor: "text-gray-900",
          textColor: "text-gray-700",
        };
    }
  };

  const config = getStatusConfig(paymentState.status);
  const baseScanUrl = "https://basescan.org/tx/";

  return (
    <div
      className={`p-4 ${config.bgColor} border ${config.borderColor} rounded-lg space-y-3`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${config.iconColor}`}>{config.icon}</div>
        <div className="flex-1">
          <div className={`font-semibold ${config.titleColor} text-base mb-1`}>
            {paymentState.status === "processing" && "Processing Payment"}
            {paymentState.status === "pending" && "Payment Pending"}
            {paymentState.status === "completed" && "Payment Successful"}
            {paymentState.status === "failed" && "Payment Failed"}
          </div>
          <div className={`text-sm ${config.textColor} leading-relaxed`}>
            {paymentState.message}
          </div>
        </div>
      </div>

      {paymentState.transactionId &&
        paymentState.transactionId !== "unknown" && (
          <div className="pt-2 border-t border-current border-opacity-20">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${config.textColor}`}>
                Transaction ID:
              </span>
              <a
                href={`${baseScanUrl}${paymentState.transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-mono ${config.textColor} underline hover:no-underline truncate max-w-[200px]`}
                title={paymentState.transactionId}
              >
                {`${paymentState.transactionId.slice(
                  0,
                  6
                )}...${paymentState.transactionId.slice(-6)}`}
              </a>
            </div>
          </div>
        )}

      {paymentState.timestamp && (
        <div className="flex items-center justify-between text-xs pt-1">
          <span className={`${config.textColor} opacity-75`}>
            {paymentState.timestamp.toLocaleTimeString()}
          </span>
          {paymentState.status === "pending" && (
            <span className={`${config.textColor} opacity-75 animate-pulse`}>
              Checking status...
            </span>
          )}
        </div>
      )}

      {paymentState.status === "completed" && (
        <div
          className={`text-xs ${config.textColor} bg-white/50 rounded px-2 py-1 mt-2`}
        >
          ✨ Payment confirmed on Base network. USDC transferred successfully!
        </div>
      )}

      {(paymentState.status === "completed" ||
        paymentState.status === "failed") && (
        <button
          onClick={onReset}
          className="w-full mt-3 px-3 py-1 text-xs bg-white/70 hover:bg-white/90 rounded border border-current border-opacity-30 transition-colors"
        >
          Make Another Payment
        </button>
      )}
    </div>
  );
}

export function BasePay() {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: "idle",
    message: "",
  });
  const [amount, setAmount] = useState("5.00");

  const { status: web3AuthStatus } = useWeb3Auth();
  const {
    sendTransaction,
    data: txHash,
    isPending,
    error,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // dylsteck.base.eth
  const recipient = "0x8342A48694A74044116F330db5050a267b28dD85";

  // USDC contract on Base Mainnet
  const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const handlePay = async () => {
    if (web3AuthStatus !== "connected") {
      setPaymentState({
        status: "failed",
        message: "Please connect your Web3Auth wallet first",
        timestamp: new Date(),
      });
      return;
    }

    try {
      setPaymentState({
        status: "processing",
        message: "Initiating USDC payment on Base...",
        timestamp: new Date(),
      });

      // USDC has 6 decimals
      const amountInWei = parseUnits(amount, 6);

      // ERC20 transfer function signature: transfer(address,uint256)
      const transferData = `0xa9059cbb${recipient
        .slice(2)
        .padStart(64, "0")}${amountInWei.toString(16).padStart(64, "0")}`;

      sendTransaction({
        to: USDC_CONTRACT as `0x${string}`,
        data: transferData as `0x${string}`,
      });
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentState({
        status: "failed",
        message: `Payment failed: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
        timestamp: new Date(),
      });
    }
  };

  // Update state based on transaction status
  if (
    txHash &&
    paymentState.status !== "completed" &&
    paymentState.status !== "failed"
  ) {
    if (isConfirming) {
      setPaymentState({
        status: "pending",
        message:
          "Payment submitted to Base network. Waiting for confirmation...",
        transactionId: txHash,
        timestamp: new Date(),
      });
    } else if (isConfirmed) {
      setPaymentState({
        status: "completed",
        message: "Payment successful! USDC has been transferred on Base.",
        transactionId: txHash,
        timestamp: new Date(),
      });
    }
  }

  if (error && paymentState.status !== "failed") {
    setPaymentState({
      status: "failed",
      message: `Payment failed: ${error.message}`,
      timestamp: new Date(),
    });
  }

  return (
    <div className="mb-4">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg my-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">💳</div>
          <div>
            <div className="font-semibold text-blue-900">Base Pay</div>
            <div className="text-xs text-blue-700">
              One-tap USDC payments on Base
            </div>
          </div>
        </div>
        <div className="text-xs text-blue-600 bg-white/50 rounded px-2 py-1">
          Fast • Low fees • Fully-backed digital dollars
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Payment Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full pl-8 pr-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="5.00"
              disabled={isPending}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Payment will be made in USDC on Base network
          </div>
        </div>

        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="text-sm font-medium text-primary mb-1">
            Payment Recipient
          </div>
          <div className="font-mono text-xs text-muted-foreground mb-1">
            {recipient}
          </div>
          <div className="text-xs text-primary/70">dylsteck.base.eth</div>
        </div>

        <div>
          <Button
            onClick={handlePay}
            disabled={isPending || web3AuthStatus !== "connected"}
            isLoading={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? "Processing..." : "Pay with Web3Auth Wallet"}
          </Button>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {web3AuthStatus !== "connected"
              ? "Please connect Web3Auth wallet first"
              : isPending
              ? "Processing payment..."
              : "Click to send USDC on Base"}
          </div>
        </div>

        {paymentState.status !== "idle" && (
          <PaymentStatusCard
            paymentState={paymentState}
            onReset={() => setPaymentState({ status: "idle", message: "" })}
          />
        )}
      </div>
    </div>
  );
}
