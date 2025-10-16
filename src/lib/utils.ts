import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const METADATA = {
  name: "Base Swiper — Tinder for Zora",
  description: "A demo mini app for testing capabilities on Base using MiniKit",
  bannerImageUrl: "https://i.imgur.com/2bsV8mV.png",
  iconImageUrl: "https://i.imgur.com/brcnijg.png",
  homeUrl: process.env.NEXT_PUBLIC_URL ?? "https://base-swiper.vercel.app",
  splashBackgroundColor: "#FFFFFF",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
