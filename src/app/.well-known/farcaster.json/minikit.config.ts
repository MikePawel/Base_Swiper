export const minikitConfig = {
  accountAssociation: {
    // this will be added in step 5
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Cubey",
    subtitle: "Your AI Ad Companion",
    description: "Ads",
    screenshotUrls: [""],
    iconUrl:
      "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/icon.png",
    splashImageUrl:
      "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/banner.png",
    splashBackgroundColor: "#000000",
    homeUrl: "https://base-swiper.vercel.app",
    webhookUrl: "https://base-swiper.vercel.app/api/webhook",
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl:
      "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/banner.png",
    tagline: "Tinder for Zora",
    ogTitle: "Base Swiper — Tinder for Zora",
    ogDescription:
      "Swipe through Zora collectibles and instantly buy them on Base",
    ogImageUrl:
      "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/banner.png",
  },
} as const;
