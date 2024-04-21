"use client"

import "@/styles/globals.css";

import { NavigationBar } from "./navbar";
import { redirect } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useLoggedInStore } from "@/store";

export default function HomeLayout({ children }: RootLayoutProps) {
  const { loggedIn } = useLoggedInStore();
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!loggedIn) {
      startTransition(() => redirect('/login'));
    }
  }, [loggedIn])

  return (
      <div className="flex min-h-screen bg-neutral-light">
        <NavigationBar/>
        <div>{ children }</div>
      </div>
  )
}
