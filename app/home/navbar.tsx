"use client"

import Image from "next/image";
import Link from "next/link";

import { FlameIcon, HomeIcon } from "lucide-react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function NavigationTab({ title, url, icon }: { title: string, url: string, icon: ReactNode }) {
    const currentUrl = usePathname();

    if (currentUrl === url) {
        return (
            <div className="mx-8 my-12 px-16 py-12 bg-primary shadow-md rounded-md font-medium text-neutral-very-light">
                <Link href={url} className="flex gap-4 items-center">{ icon }{ title }</Link>
            </div>
        )
    }

    return (
        <div className="mx-8 px-16 py-12 hover:bg-primary hover:rounded-md font-medium text-neutral hover:text-neutral-very-light">
            <Link href={url} className="flex gap-4 items-center">{ icon }{ title }</Link>
        </div>
    )
}

export function NavigationPane({ className = "" }: { className?: string }) {
    return (
        <div className={"flex flex-col mt-14 overflow-y-auto" + " " + className}>
            <NavigationTab title="Home" url="/home" icon={<HomeIcon/>} />
            <NavigationTab title="Fire alert" url="/home/fire-alert" icon={<FlameIcon/>} />
        </div>
    )
}

export function AvatarPane({ className = "" }: { className?: string }) {
    const [email] = useLocalStorage("email", "");

    return (
        <div className={"flex gap-2 items-center mx-8 px-16 py-16" + " " + className}>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar className="bg-warning-dark text-neutral-very-light">
                        <AvatarFallback>{ email[0]?.toUpperCase() }</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <p className="overflow-clip">{ email }</p>
        </div>
    )
}

export function NavigationBar() {
    return (
        <nav className="min-h-screen bg-primary-slightly-dark text-neutral-very-light w-250 shadow-xl shadow-primary-slightly-light fixed">
            <div className="bg-primary p-16 shadow-md">
                <Link href="/home" className="flex gap-2 justify-start text-2 items-center">
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
                <AvatarPane/>
                <NavigationPane/>
            </div>
        </nav>
    )
}