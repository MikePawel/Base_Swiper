import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const METADATA = {
  name: "Base Swiper — Tinder for Zora",
  description: "Swipe through Zora collectibles and instantly buy them on Base",
  bannerImageUrl:
    "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/banner.png",
  iconImageUrl:
    "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/icon.png",
  homeUrl: process.env.NEXT_PUBLIC_URL ?? "https://base-swiper.vercel.app",
  splashBackgroundColor: "#FFFFFF",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
