"use client";

import "@/styles/globals.css";

import { NavigationBar } from "./navbar";
import { redirect } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useLoggedInStore } from "@/store";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

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
    <div className="flex flex-row min-h-screen gap-4 bg-neutral-very-light">
      <NavigationBar />
      <div className="p-12 w-full transform transition duration-300 ease-in-out">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem className="flex items-center">
              <HomeIcon size={18} />
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {children}
      </div>
    </div>
  );
}
