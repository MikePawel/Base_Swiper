export async function GET() {
  const config = {
    frame: {
      name: "Base Swiper",
      version: "1",
      iconUrl:
        "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/icon.png",
      homeUrl: "https://base-swiper.vercel.app",
      imageUrl:
        "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/icon.png",
      buttonTitle: "Open mini app",
      splashImageUrl: "https://base-swiper.vercel.app/splash.png",
      splashBackgroundColor: "#0000FF",
      webhookUrl: "https://base-swiper.vercel.app/api/webhook",
      subtitle: "Base Swiper — Tinder for Zora",
      description:
        "Swipe through Zora collectibles and instantly buy them on Base",
      primaryCategory: "finance",
      tags: ["social", "art", "finance", "tinder", "swipe"],
      heroImageUrl:
        "https://raw.githubusercontent.com/MikePawel/Base_Swiper/refs/heads/main/public/banner.png",
      tagline: "Tinder for Zora",
      ogTitle: "Base Swiper — Tinder for Zora",
    },
    accountAssociation: {
      header:
        "eyJmaWQiOjEzODYxODksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg0NTZGNWExYjM0MTE4YzVEOGY1ZmVjMDhlYjREYTc2Y0JBZmMzQkQ4In0",
      payload: "eyJkb21haW4iOiJiYXNlLXN3aXBlci52ZXJjZWwuYXBwIn0",
      signature:
        "j57ZkIsDuRnJm9529PpTNN0ZRo82vDpSiWj/0+x9HWkDZpF4Agfy7+6/2bQ7oXR4l0LHSShfnsqLWtrdRRyY6Bs=",
    },
    baseBuilder: {
      ownerAddress: "0xE8597d4f1faCa468b1cfB34730627B56923629dD",
    },
  };

  return Response.json(config);
}
