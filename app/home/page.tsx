"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  ChevronDownIcon,
  HomeIcon,
  ShieldCheckIcon,
  Volume2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MyChart = dynamic(() => import("./chart"), { ssr: false });

export default function HomePage() {
  const [position, setPosition] = useState<string>("bottom");

  const ROOM = [
    {
      id: 0,
      name: "Room A",
      status: "Safe",
    },
    {
      id: 1,
      name: "Room B",
      status: "Safe",
    },
    {
      id: 2,
      name: "Room C",
      status: "Safe",
    },
    {
      id: 3,
      name: "Room D",
      status: "Safe",
    },
    {
      id: 4,
      name: "Room E",
      status: "Safe",
    },
    {
      id: 5,
      name: "Room F",
      status: "Safe",
    },
    {
      id: 6,
      name: "Room G",
      status: "Safe",
    },
    {
      id: 7,
      name: "Room H",
      status: "Safe",
    },
    {
      id: 8,
      name: "Room I",
      status: "Safe",
    },
  ];

  const DEVICE_IN_ROOM = [
    
  ]

  return (
    <div className="grid gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="flex items-center">
            <HomeIcon size={18} />
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="w-full bg-[#FFFFFF] border-none shadow-md grid grid-cols-4 divide-x divide-neutral-slightly-light">
        <div className="p-16 flex flex-col">
          <CardContent className="flex flex-col items-center justify-center h-full">
            <p className="text-neutral-dark text-20 font-normal">
              Your house is
            </p>
            <p className="text-safe-slightly-dark text-36 font-bold">SAFE</p>
          </CardContent>
          <CardFooter className="flex justify-between items-end">
            <Button variant="outline" className="p-16">
              Mute all
            </Button>
            <Button variant="outline" className="p-16">
              Unmute all
            </Button>
          </CardFooter>
        </div>
        <div className="p-16 col-span-3 grid grid-cols-3 gap-4">
          {ROOM.map((room) => (
            <Card
              key={room.id}
              className="w-full bg-[#FFFFFF] border-none drop-shadow-md hover:cursor-pointer hover:shadow-lg"
            >
              <CardContent className="p-16 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <ShieldCheckIcon size={18} color="gray" />
                    <p className="text-neutral-very-dark font-bold text-20">
                      {room.name}
                    </p>
                  </div>
                  <p className="text-neutral-dark font-bold text-14">
                    {room.status}
                  </p>
                </div>
                <Volume2Icon size={18} color="gray" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="p-16 bg-neutral-dark w-192">
            <Button
              variant="outline"
              className="text-[#FFFFFF] flex items-center justify-between"
            >
              <p>Open</p>
              <ChevronDownIcon size={18} color="white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full z-50 bg-[#FFFFFF] shadow-lg p-16 text-left">
            <DropdownMenuRadioGroup
              value={position}
              onValueChange={setPosition}
            >
              <DropdownMenuRadioItem value="top">
                CO Concentration
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom">
                Smoke
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="right">Flame</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="right">
                Gas Leak
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Card className="w-full bg-[rgb(255,255,255)] border-none drop-shadow-md">
          <CardContent className="grid grid-cols-4 justify-center divide-x divide-neutral-dark">
            <div className="p-16 col-span-3">
              <MyChart />
            </div>
            <div className="p-16 flex flex-col gap-4">
              <p className="flex justify-center items-start text-neutral-very-dark text-24 font-bold">
                Rooms
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <hr className="w-24 bg-danger text-danger h-4" />
                  <div className="flex items-center gap-1">
                    <p className="text-neutral-very-dark text-16 font-semibold">
                      Bedroom F1:
                    </p>
                    <p className="text-neutral-very-dark text-16 font-normal">
                      50ppm
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <hr className="w-24 bg-primary text-primary h-4" />
                  <div className="flex items-center gap-1">
                    <p className="text-neutral-very-dark text-16 font-semibold">
                      Bedroom F1:
                    </p>
                    <p className="text-neutral-very-dark text-16 font-normal">
                      50ppm
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <hr className="w-24 bg-neutral-very-dark text-neutral-very-dark h-4" />
                  <p className="text-neutral-very-dark text-16 font-normal">
                    Kitchen:
                  </p>
                  <p className="text-neutral-very-dark text-16 font-semibold">
                    50ppm
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
