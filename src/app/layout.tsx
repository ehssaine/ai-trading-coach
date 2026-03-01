import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradingCoach - Stay Disciplined, Trade Smart",
  description:
    "Professional trading journal and analysis tool to help you stick to the plan and trade with the higher timeframe direction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-gray-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
