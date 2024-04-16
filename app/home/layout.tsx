"use client"

import "@/styles/globals.css";

import { NavigationBar } from "./navbar";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { redirect } from "next/navigation";
import { useEffect, useTransition } from "react";

export default function HomeLayout({ children }: RootLayoutProps) {
  const [loggedIn, setLoggedIn] = useLocalStorage("loggedIn", true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!loggedIn) {
      startTransition(() => redirect('/login'));
    }
  }, [loggedIn])

  return (
      <div className="flex min-h-screen bg-neutral-light">
        <NavigationBar loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>
        <div>{ children }</div>
      </div>
  )
}
