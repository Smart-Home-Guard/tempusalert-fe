import { Inter as FontSans } from "next/font/google";
import { Metadata } from "next";

import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Tempusalert",
  description: "An interface for displaying sensor metrics and remote controlling your smart house",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head />
      <body
        className={cn(
          "min-h-screen bg-neutral-very-light font-sans antialiased m-12",
          fontSans.variable
        )}
      >
        <main>{ children }</main>
        <Toaster />
      </body>
    </html>
  )
}
