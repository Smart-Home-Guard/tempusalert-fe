import { Inter as FontSans } from "next/font/google";
import { Metadata } from "next";

import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

import ClientApplication from "./clientApplication";

export const metadata: Metadata = {
  title: "Tempusalert",
  description:
    "An interface for displaying sensor metrics and remote controlling your smart house",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body
        className={cn(
          "min-h-screen bg-neutral-light font-sans antialiased",
          fontSans.variable
        )}
      >
        <ClientApplication>
          <main>{children}</main>
        </ClientApplication>
        <Toaster />
      </body>
    </html>
  );
}
