"use client";

import Image from "next/image";
import Link from "next/link";

import { FlameIcon, HomeIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { ReactNode, useTransition, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useEmailStore,
  useIsNavBarCollapsed,
  useJwtStore,
  useLoggedInStore,
} from "@/store";
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Tooltip } from "@/components/ui/tooltip";

export function NavigationTab({
  title,
  url,
  icon,
}: {
  title: string;
  url: string;
  icon: ReactNode;
}) {
  const currentUrl = usePathname();

  if (currentUrl === url) {
    return (
      <div className="mx-8 my-12 px-16 py-12 bg-primary shadow-md rounded-md font-medium text-neutral-very-light">
        <Link href={url} className="flex gap-4 items-center">
          {icon}
          {title}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-8 px-16 py-12 hover:bg-primary hover:rounded-md font-medium text-neutral hover:text-neutral-very-light">
      <Link href={url} className="flex gap-4 items-center">
        {icon}
        {title}
      </Link>
    </div>
  );
}

export function NavigationPane({ className = "" }: { className?: string }) {
  return (
    <div className={"flex flex-col mt-14 overflow-y-auto" + " " + className}>
      <NavigationTab title="Home" url="/home" icon={<HomeIcon />} />
      <NavigationTab
        title="Fire alert"
        url="/home/fire-alert"
        icon={<FlameIcon />}
      />
    </div>
  );
}

export function AvatarPane({ className = "" }: { className?: string }) {
  const { email, removeEmail } = useEmailStore();
  const { removeJwt } = useJwtStore();
  const { setLoggedIn } = useLoggedInStore();
  const [, startTransition] = useTransition();

  return (
    <div
      className={"flex gap-2 items-center mx-8 px-16 py-16" + " " + className}
    >
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="bg-warning-dark text-neutral-very-light drop-shadow-md">
            <AvatarFallback>{email[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="danger"
            onClick={() => {
              removeEmail();
              removeJwt();
              setLoggedIn(false);
              startTransition(() => redirect("/"));
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="overflow-hidden text-ellipsis drop-shadow-md whitespace-nowrap">
            {email}
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent className="rounded-md bg-neutral-very-dark p-4 text-12 text-neutral-very-light shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
              {email}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function NavigationBar() {
  const [isHoverSidebar, setIsHoverSidebar] = useState<boolean>(false);
  const [hoverTimeout, setHoverTimeout] = useState<any>(undefined);
  const {
    isNavBarCollapsed: isCollapsed,
    setIsNavBarCollapsed: setIsCollapsed,
  } = useIsNavBarCollapsed();

  return (
    <div
      className="min-h-screen p-0 m-0"
      onMouseEnter={() => {
        hoverTimeout && clearTimeout(hoverTimeout);
        setIsHoverSidebar(true);
      }}
      onMouseLeave={() =>
        setHoverTimeout(setTimeout(() => setIsHoverSidebar(false), 500))
      }
    >
      <div
        className={`w-${
          isCollapsed ? "[0]" : "[220px]"
        } transform transition-all duration-300 ease-in-out`}
      />
      <nav
        className={`h-full bg-primary-slightly-dark text-neutral-very-light w-[220px] shadow-xl shadow-primary-slightly-light fixed transform transition duration-300 ease-in-out ${
          isCollapsed ? "-translate-x-full" : ""
        }`}
      >
        <div className="bg-primary p-16 shadow-md">
          <Link
            href="/home"
            className="flex gap-2 justify-start text-2 items-center"
          >
            <Image
              src="/brand-logo.png"
              width={500}
              height={500}
              className="w-64 h-64"
              alt="Brand logo"
            />
            <p className="text-18 font-bold">Tempusalert</p>
          </Link>
        </div>
        <div className="flex flex-col h-full">
          <AvatarPane />
          <NavigationPane />
        </div>
        <div
          className={`transition-opacity duration-100 opacity-${
            isHoverSidebar || isCollapsed ? "100" : "0"
          }`}
        >
          <div className="fixed top-1/2 left-[220px] border-l-primary-dark border-l-[8px] border-t-[transparent] border-t-[10px] border-b-[transparent] border-b-[10px] w-[0] h-64 bg-[transparent] z-40 rounded-none" />
          <button
            className="fixed top-1/2 left-[218px] w-[8px] h-64 bg-[transparent] z-40 rounded-none text-neutral-light"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="w-12" />
            ) : (
              <ChevronLeft className="w-12" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
