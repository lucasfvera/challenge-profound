import type { Metadata } from "next";
import "./globals.css";
import { PRODUCT_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description:
    "A deterministic AI-visibility dashboard for the fictional brand Northstar. All data is simulated.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
