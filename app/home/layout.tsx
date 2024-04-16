"use client"

import "@/styles/globals.css";

import { NavigationBar } from "./navbar";
import { useLocalStorage } from "usehooks-ts";
import { redirect } from "next/navigation";

export default function HomeLayout({ children }: RootLayoutProps) {
  const [loggedIn] = useLocalStorage("loggedIn", false);

  if (!loggedIn) {
    redirect('/login');
  }

  return (
      <div className="flex min-h-screen bg-neutral-light">
        <NavigationBar />
        <div>{ children }</div>
      </div>
  )
}
