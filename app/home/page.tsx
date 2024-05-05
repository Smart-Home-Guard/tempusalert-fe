"use client";

import dynamic from "next/dynamic";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HomeIcon, ShieldCheckIcon, Volume2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

const MyChart = dynamic(() => import("./chart"), { ssr: false });

export default function HomePage() {
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
                    <p className="text-neutral-very-dark font-extrabold text-20">{room.name}</p>
                  </div>
                  <p className="text-neutral-dark font-bold text-14">{room.status}</p>
                </div>
                <Volume2Icon size={18} color="gray" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>
      <div className="grid items-center justify-center text-center">
        <Tabs defaultValue="CO" className="w-[900px]">
          <TabsList className="flex items-center gap-4 justify-start">
            <TabsTrigger value="CO">CO</TabsTrigger>
            <TabsTrigger value="Smoke">Smoke</TabsTrigger>
            <TabsTrigger value="Flame">Flame</TabsTrigger>
            <TabsTrigger value="LPG">LPG</TabsTrigger>
          </TabsList>
          <TabsContent value="CO">
            <MyChart />
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
