"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
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
  CirclePlusIcon,
  ShieldCheckIcon,
  Volume2Icon,
} from "lucide-react";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { useEmailStore, useJwtStore } from "@/store";
import { useToast } from "@/components/ui/use-toast";

const MetricHistoryChart = dynamic(() => import("./metricLineChart"), {
  ssr: false,
});

export type MetricType = "co" | "smoke" | "flame" | "gas";

type RoomStatus = {
  name: string;
  components: {
    id: number;
    status: string;
  }[];
};

export default function HomePage() {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);

  const { toast } = useToast();
  const { email } = useEmailStore();
  const { jwt } = useJwtStore();

  const fetchRoomStatuses = useCallback(async () => {
    const roomNamesRes = await apiClient.GET("/api/rooms/", {
      params: {
        query: {
          email,
          name_only: "",
        },
      },
      headers: {
        jwt,
      },
    });

    if (roomNamesRes.error) {
      toast({
        title: "Fetch room names failed",
        description: roomNamesRes.error.message,
        variant: "destructive",
      });
      return;
    }

    const roomNames = roomNamesRes.data.value as string[];

    const roomStatusRes = await Promise.all(
      roomNames.map((name) =>
        apiClient.GET("/api/fire-alert/status", {
          params: {
            query: {
              email,
              room_name: name,
            },
          },
          headers: {
            jwt,
          },
        })
      )
    );

    const err = roomStatusRes.find((res) => res.error);
    if (err) {
      toast({
        title: "Fetch room statuses failed",
        description: err.error!.message,
        variant: "destructive",
      });
      return;
    }

    const roomStatuses = roomStatusRes.map(
      (res) => (res.data as any).component_statuses
    );

    setRooms(
      _.zipWith(roomNames, roomStatuses, (name, statuses) => ({
        name,
        components: statuses,
      }))
    );
  }, [email, jwt, toast]);

  useEffect(() => {
    fetchRoomStatuses();
  }, [fetchRoomStatuses]);

  return (
    <div className="flex flex-col gap-4 overflow-x-auto">
      <RoomStatusSection rooms={rooms} />
      <MetricChartSection rooms={rooms.map(({ name }) => name)} />
    </div>
  );
}

function RoomStatusSection({ rooms }: { rooms: RoomStatus[] }) {
  const roomData = rooms.map((room) => ({
    ...room,
    isSafe: room.components.every((component) => component.status === "SAFE"),
  }));

  const isHouseSafe = roomData.every((room) => room.isSafe);
  const { email } = useEmailStore();
  const { jwt } = useJwtStore();
  const { toast } = useToast();

  const createRoom = async () => {
    const res = await apiClient.POST("/api/rooms/", {
      body: {
        email,
        room_name: "New Room",
      },
      headers: {
        jwt,
      },
    });

    if (res.error) {
      toast({
        title: "Create room failed",
        description: res.error.message,
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <Card className="w-full bg-[#FFFFFF] border-none shadow-md">
      <div className="p-16 flex flex-col">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <p className="text-neutral-dark text-20 font-normal">Your house is</p>
          <p
            className={`${
              isHouseSafe
                ? "text-safe-slightly-dark"
                : "text-danger-slightly-dark"
            } text-36 font-bold`}
          >
            {isHouseSafe ? "SAFE" : "UNSAFE"}
          </p>
        </CardContent>
        {roomData.length > 0 && (
          <CardFooter className="flex justify-between items-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 p-16 bg-primary text-neutral-very-light hover:bg-primary-slightly-dark"
            >
              <CirclePlusIcon size={18} color="white" />
              Create new
            </Button>
            <div className="flex gap-4 my-8 sm:my-4">
              <Button variant="outline" className="p-16 sm:text-14 text-12">
                Mute all
              </Button>
              <Button variant="outline" className="p-16">
                Unmute all
              </Button>
            </div>
          </CardFooter>
        )}
      </div>
      <div className="p-16 col-span-3 grid grid-cols-3 gap-4">
        {roomData.map((room) => (
          <Card
            key={room.name}
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
                <p
                  className={`${
                    room.isSafe
                      ? "text-safe-slightly-dark"
                      : "text-danger-slightly-dark"
                  } font-bold md:text-14 text-12 text-center md:text-left`}
                >
                  {room.isSafe ? "safe" : "unsafe"}
                </p>
              </div>
              <Volume2Icon size={18} color="gray" />
            </CardContent>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function MetricChartSection({ rooms }: { rooms: string[] }) {
  const [data, setData] = useState({});
  const { email } = useEmailStore();
  const { jwt } = useJwtStore();

  useEffect(() => {
    Promise.all(
      rooms.map((room_name) =>
        apiClient.GET("/api/fire-alert/status", {
          params: {
            query: {
              email,
              room_name,
              fire: true,
              gas: true,
              heat: true,
              light: true,
              smoke: true,
              buzzer: true,
              button: true,
              co: true,
            },
          },
          headers: {
            jwt,
          },
        })
      )
    ).then(setData);
  }, [rooms, email, jwt]);

  const [metricType, setMetricType] = useState<MetricType>("co");

  const metricTypeMap: Record<
    MetricType,
    {
      title: string;
      subtitle: string;
    }
  > = {
    co: {
      title: "CO concentration",
      subtitle: "By ppm",
    },
    flame: {
      title: "Heat",
      subtitle: "By °C",
    },
    gas: {
      title: "Gas concentration",
      subtitle: "By ppm",
    },
    smoke: {
      title: "Smoke concentration",
      subtitle: "By ppm",
    },
  };

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
                onValueChange={setMetricType as any}
              >
                <DropdownMenuRadioItem
                  value="co"
                  className="hover:bg-primary hover:text-neutral-light rounded-lg p-4"
                >
                  CO Concentration
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="smoke"
                  className="hover:bg-primary hover:text-neutral-light rounded-lg p-4"
                >
                  Smoke
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="flame"
                  className="hover:bg-primary hover:text-neutral-light rounded-lg p-4"
                >
                  Flame
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="gas"
                  className="hover:bg-primary hover:text-neutral-light rounded-lg p-4"
                >
                  Gas Leak
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
        <div className="p-16 col-span-3">
          <MetricHistoryChart
            data={{}}
            {...metricTypeMap[metricType]}
            metricType={metricType}
          />
        </div>
      </CardContent>
    </Card>
  );
}
