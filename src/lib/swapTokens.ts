import { formatUnits, parseUnits } from "viem";

// USDC contract on Base Mainnet
export const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// ERC20 ABI for balanceOf
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

// Helper to check if user has enough USDC
export function checkSufficientBalance(
  balance: bigint | undefined,
  requiredAmount: string
): boolean {
  if (!balance) return false;
  const required = parseUnits(requiredAmount, 6); // USDC has 6 decimals
  return balance >= required;
}

// Format USDC balance for display
export function formatUSDCBalance(balance: bigint | undefined): string {
  if (!balance) return "0";
  return formatUnits(balance, 6);
}
