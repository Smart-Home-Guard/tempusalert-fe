"use client";

import "@/styles/globals.css";

import { NavigationBar } from "./navbar";
import { redirect, usePathname } from "next/navigation";
import { Fragment, useEffect, useTransition } from "react";
import { useLoggedInStore } from "@/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FlameIcon, HomeIcon } from "lucide-react";

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
        <AppBreadcrumb />
        {children}
      </div>
    </div>
  );
}

function AppBreadcrumb() {
  const pathname = usePathname();
  const pathComponents = pathname.split("/").slice(1);

  const itemMap: {
    [index: string]: Record<"href", string> &
      Record<"icon", typeof HomeIcon> &
      Record<"name", string>;
  } = {
    home: {
      icon: HomeIcon,
      href: "/home/",
      name: "Home",
    },
    "fire-alert": {
      icon: FlameIcon,
      href: "/home/fire-alert",
      name: "Fire alert",
    },
  };

  return (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        {pathComponents.map((p) => {
          const Icon = itemMap[p].icon;
          const href = itemMap[p].href;
          const name = itemMap[p].name;

          return (
            <Fragment key={p}>
              <BreadcrumbItem className="flex items-center">
                <Icon size={18} />
                <BreadcrumbLink href={href}>{name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <p className="text-neutral">/</p>
              </BreadcrumbSeparator>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
