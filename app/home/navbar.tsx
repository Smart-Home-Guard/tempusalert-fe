"use client"

import Image from "next/image";
import Link from "next/link";

import { FlameIcon, HomeIcon } from "lucide-react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

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

export function NavigationBar() {
    return (
        <nav className="min-h-screen bg-primary-slightly-dark text-neutral-very-light w-250 shadow-xl shadow-primary-slightly-light">
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
            <div className="flex flex-col mt-32">
                <NavigationTab title="Home" url="/home" icon={<HomeIcon/>} />
                <NavigationTab title="Fire alert" url="/home/fire-alert" icon={<FlameIcon/>} />
            </div>
            <div>

            </div>
        </nav>
    )
}