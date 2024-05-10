"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  ChevronDownIcon,
  ShieldCheckIcon,
  Volume2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MetricHistoryChart = dynamic(() => import("./metricLineChart"), { ssr: false });

export default function HomePage() {
 
  return (
    <div className="flex flex-col gap-4 overflow-x-auto">
      <RoomStatusSection />
      <MetricChart />
    </div>
  );
}

function RoomStatusSection() {
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
    <Card className="w-full bg-[#FFFFFF] border-none shadow-md">
      <div className="p-16 flex flex-col">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <p className="text-neutral-dark text-20 font-normal">
            Your house is
          </p>
          <p className="text-safe-slightly-dark text-36 font-bold">
            SAFE
          </p>
        </CardContent>
        <CardFooter className="flex justify-center md:justify-end  items-end gap-4 my-8 sm:my-4">
          <Button variant="outline" className="p-16 sm:text-14 text-12">
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
            <CardContent className="p-16 flex flex-col md:flex-row gap-1 items-center justify-between">
              <div>
                <div className="flex flex-col text-center md:flex-row items-center gap-1">
                  <ShieldCheckIcon size={18} color="gray" />
                  <p className="text-neutral-very-dark font-bold md:text-20 text-14"> 
                    {room.name}
                  </p>
                </div>
                <p className="text-neutral-dark font-bold md:text-14 text-12 text-center md:text-left">
                  {room.status}
                </p>
              </div>
              <Volume2Icon size={18} color="gray" />
            </CardContent>
          </Card>
        ))}
      </div>
    </Card>
  )
}

function MetricChart() {
  const [metricType, setMetricType] = useState<string>("co");
  
  return ( 
    <Card className="w-full bg-[#FFFFFF] border-none drop-shadow-md">
      <CardContent className="justify-center items-start p-16">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild className="p-16 bg-neutral-dark">
            <Button
              variant="outline"
              className="text-neutral-very-light flex items-center justify-between"
            >
              <p>Open</p>
              <ChevronDownIcon size={18} color="white" />
            </Button>
          </DropdownMenuTrigger>
        
          <DropdownMenuPortal>
            <DropdownMenuContent className="w-full z-50 bg-neutral-slightly-light shadow-lg p-4 text-left rounded-lg">
              <DropdownMenuRadioGroup
                value={metricType}
                onValueChange={setMetricType}
              >
                <DropdownMenuRadioItem value="co" className="hover:bg-primary hover:text-neutral-light rounded-lg p-4">
                  CO Concentration
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="smoke" className="hover:bg-primary hover:text-neutral-light rounded-lg p-4">
                  Smoke
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="flame" className="hover:bg-primary hover:text-neutral-light rounded-lg p-4">
                  Flame
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="gas" className="hover:bg-primary hover:text-neutral-light rounded-lg p-4">
                  Gas Leak
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
        <div className="p-16 col-span-3">
          <MetricHistoryChart data={{}} title={metricType} subtitle="" />
        </div>
      </CardContent>
    </Card>
  )
}
