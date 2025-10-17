import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const METADATA = {
  name: "Base Swiper — Tinder for Zora",
  description: "Swipe through Zora collectibles and instantly buy them on Base",
  bannerImageUrl: "https://imgur.com/ZIqxpsk.png",
  iconImageUrl: "https://imgur.com/rLshpa8.png",
  homeUrl: process.env.NEXT_PUBLIC_URL ?? "https://base-swiper.vercel.app",
  splashBackgroundColor: "#FFFFFF",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
