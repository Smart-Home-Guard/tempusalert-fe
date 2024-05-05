"use client";

import "@/styles/globals.css";

import { NavigationBar } from "./navbar";
import { redirect } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useLoggedInStore } from "@/store";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, loggedIn } = useLoggedInStore();
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (ready && !loggedIn) {
      startTransition(() => redirect("/login"));
    }
  }, [ready, loggedIn]);

  return (
    <div className="flex min-h-screen bg-neutral-very-light">
      <NavigationBar />
      <div className="ml-[220px] p-12 w-full">{children}</div>
    </div>
  );
}
