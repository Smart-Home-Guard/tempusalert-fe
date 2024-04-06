import { Inter as FontSans } from "next/font/google";
import { Metadata } from "next";

import "@/styles/globals.css";
import { cn, urlBase64ToUint8Array } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

export const metadata: Metadata = {
  title: "Tempusalert",
  description: "An interface for displaying sensor metrics and remote controlling your smart house",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      apiClient.GET("/api/push-credential/public-key")
        .then(({ data: applicationServerKey }) =>
          navigator.serviceWorker
            .register("/push-notification-listener.js")
            .then((registration) => registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(applicationServerKey!),
        })))
    }
  }, []);


  return (
    <html lang="en">
      <head />
      <body
        className={cn(
          "min-h-screen bg-neutral-light font-sans antialiased m-12",
          fontSans.variable
        )}
      >
        <main>{ children }</main>
        <Toaster />
      </body>
    </html>
  )
}
