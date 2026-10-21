import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRODUCT_NAME } from "@/lib/site";

/**
 * Inter is self-hosted from a committed WOFF2 so the production build never
 * reaches out to a font CDN; the type scale lives in docs/design-system.md.
 */
const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description:
    "A deterministic AI-visibility dashboard for the fictional brand Northstar. All data is simulated.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("dark h-full antialiased", inter.variable)}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <span className="text-sm font-semibold tracking-tight">
              {PRODUCT_NAME}
            </span>
            <Badge variant="outline" className="text-muted-foreground">
              Simulated data
            </Badge>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
