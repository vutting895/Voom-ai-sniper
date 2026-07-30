import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voom AI Sniper",
  description: "AI Trading Dashboard with Sniper Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
