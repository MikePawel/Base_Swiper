export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjEzODYxODksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg0NTZGNWExYjM0MTE4YzVEOGY1ZmVjMDhlYjREYTc2Y0JBZmMzQkQ4In0",
    payload: "eyJkb21haW4iOiJiYXNlLXN3aXBlci52ZXJjZWwuYXBwIn0",
    signature:
      "j57ZkIsDuRnJm9529PpTNN0ZRo82vDpSiWj/0+x9HWkDZpF4Agfy7+6/2bQ7oXR4l0LHSShfnsqLWtrdRRyY6Bs=",
  },
  miniapp: {
    version: "1",
    name: "Base Swiper",
    subtitle: "Tinder for Zora",
    description:
      "Swipe through Zora collectibles and instantly buy them on Base",
    screenshotUrls: [""],
    iconUrl:
      "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/icon.png",
    splashImageUrl:
      "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/banner.png",
    splashBackgroundColor: "#000000",
    homeUrl: "https://base-swiper.vercel.app",
    webhookUrl: "https://base-swiper.vercel.app/api/webhook",
    primaryCategory: "social",
    tags: [
      "marketing",
      "ads",
      "quickstart",
      "tinder",
      "swipe",
      "zora",
      "collectibles",
      "finance",
      "art",
      "social",
      "tokens",
      "trading",
      "defi",
      "dex",
      "nft",
    ],
    heroImageUrl:
      "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/banner.png",
    tagline: "Tinder for Zora",
    ogTitle: "Base Swiper — Tinder for Zora",
    ogDescription:
      "Swipe through Zora collectibles and instantly buy them on Base",
    ogImageUrl:
      "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/banner.png",
  },
  baseBuilder: {
    allowedAddresses: [
      "0xE8597d4f1faCa468b1cfB34730627B56923629dD",
      "mikepawel.base.eth",
    ],
    ownerAddress: "0xE8597d4f1faCa468b1cfB34730627B56923629dD",
  },
} as const;
