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
  XIcon,
} from "lucide-react";
import _ from "lodash";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { apiClient } from "@/lib/apiClient";
import { useEmailStore, useJwtStore } from "@/store";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect, OptionType } from "@/components/ui/multiselect";
import { RoomChart as RoomHistoryChart } from "./roomChart";

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

  const fetchRoomStatus = useCallback(async () => {
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
    fetchRoomStatus();
  }, [fetchRoomStatus]);

  return (
    <div className="flex flex-col gap-4 overflow-x-auto">
      <RoomStatusSection rooms={rooms} fetchRoomStatus={fetchRoomStatus} />
      <MetricChartSection rooms={rooms.map(({ name }) => name)} />
    </div>
  );
}

function RoomStatusSection({
  rooms,
  fetchRoomStatus,
}: {
  rooms: RoomStatus[];
  fetchRoomStatus: () => Promise<void>;
}) {
  const roomData = rooms.map((room) => ({
    ...room,
    isSafe: room.components.every((component) => component.status === "SAFE"),
  }));

  const formSchema = z.object({
    room_name: z
      .string()
      .min(1, { message: "The room name must contain at least 1 character" }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      room_name: "",
    },
  });

  const isHouseSafe = roomData.every((room) => room.isSafe);
  const { email } = useEmailStore();
  const { jwt } = useJwtStore();
  const { toast } = useToast();

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  function RoomChart({ roomName }: { roomName: string }) {
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
            <RoomHistoryChart
              roomName={roomName}
              data={{}}
              {...metricTypeMap[metricType]}
              metricType={metricType}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(newRoom: z.infer<typeof formSchema>) {
    const res = await apiClient.POST("/api/rooms/", {
      body: {
        email,
        room_name: newRoom.room_name,
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

    toast({
      title: "Create room success",
      description: "Room has been created",
      variant: "safe",
    });

    await fetchRoomStatus();
    setOpenDialog(false);
  }

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
        <CardFooter className="flex justify-between items-center">
          <Dialog
            open={openDialog}
            onOpenChange={() => {
              form.reset();
              setOpenDialog(!openDialog);
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 p-16 bg-primary text-neutral-very-light hover:bg-primary-slightly-dark"
              >
                <CirclePlusIcon size={18} color="white" />
                Create room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#FFFFFF] border-none shadow-md p-16">
              <DialogTitle className="flex items-center justify-between">
                <p className="text-20 font-bold text-neutral-very-dark">
                  Create room
                </p>
                <XIcon
                  size={24}
                  color="black"
                  className="cursor-pointer p-4 hover:bg-neutral rounded-full"
                  onClick={() => setOpenDialog(false)}
                />
              </DialogTitle>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="room_name"
                    render={({ field }) => (
                      <FormItem className="grid gap-4">
                        <FormControl>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="room_name" className="text-right">
                              Room Name
                            </Label>
                            <Input {...field} className="col-span-3" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="p-16 bg-primary text-neutral-very-light hover:bg-primary-slightly-dark"
                    >
                      Create room
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          {roomData.length > 0 && (
            <div className="flex gap-4 my-8 sm:my-4">
              <Button variant="outline" className="p-16 sm:text-14 text-12">
                Mute all
              </Button>
              <Button variant="outline" className="p-16">
                Unmute all
              </Button>
            </div>
          )}
        </CardFooter>
      </div>
      <div className="p-16 col-span-3 grid grid-cols-3 gap-4">
        {roomData.map((room) => (
          <Dialog key={room.name}>
            <DialogTrigger asChild>
              <Card className="w-full bg-[#FFFFFF] border-none drop-shadow-md hover:cursor-pointer hover:shadow-lg">
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
            </DialogTrigger>
            <DialogContent className="bg-[#FFFFFF] border-none shadow-md p-16">
              <DialogTitle className="flex items-center justify-start text-20 font-bold text-neutral-very-dark">
                {room.name}
              </DialogTitle>
              <DialogAddDevice roomName={room.name} />
              <div className="grid grid-cols-2 gap-4">
                {room.components.map((component) => (
                  <div
                    key={component.id}
                    className={`${
                      component.status === "SAFE"
                        ? "bg-safe-slightly-dark"
                        : "bg-danger-slightly-dark"
                    } p-16 rounded-lg`}
                  >
                    <p className="text-14 font-bold text-neutral-very-light">
                      {component.status}
                    </p>
                  </div>
                ))}
              </div>
              <RoomChart roomName={room.name} />
            </DialogContent>
          </Dialog>
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

function DialogAddDevice({ roomName }: { roomName: string }) {
  const { toast } = useToast();
  const { email } = useEmailStore();
  const { jwt } = useJwtStore();

  const [deviceIds, setDeviceIds] = useState<OptionType[]>([]);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const formAddDeviceSchema = z.object({
    device_ids: z
      .array(z.custom<OptionType>())
      .min(1, { message: "Please select at least one device." }),
    email: z
      .string()
      .min(1, { message: "This field has to be filled." })
      .email("This is not a valid email."),
    room_name: z
      .string()
      .min(1, { message: "The room name must contain at least 1 character." }),
  });

  const fetchDeviceIds = useCallback(async () => {
    const res = await apiClient.GET("/api/device-status/devices", {
      params: {
        query: {
          email: email,
        },
      },
      headers: {
        jwt,
      },
    });

    if (res.error) {
      toast({
        title: "Fetch device ids failed",
        description: res.error.message,
        variant: "destructive",
      });
      return [];
    }

    const deviceIds: OptionType[] =
      res.data.devices?.map((device) => ({
        label: `Device ${device.id}`,
        value: `${device.id}`,
      })) ?? [];
    setDeviceIds(deviceIds);
  }, [email, jwt, toast]);

  useEffect(() => {
    fetchDeviceIds();
  }, [fetchDeviceIds]);

  const formAddDevice = useForm<z.infer<typeof formAddDeviceSchema>>({
    resolver: zodResolver(formAddDeviceSchema),
    defaultValues: {
      device_ids: deviceIds,
      email: email,
      room_name: roomName,
    },
  });

  const onHandleSubmit = async (data: z.infer<typeof formAddDeviceSchema>) => {
    const res = await apiClient.POST("/api/rooms/devices", {
      body: {
        email: data.email,
        room_name: data.room_name,
        device_ids: data.device_ids.map((id) => Number(id)),
      },
      headers: {
        jwt,
      },
    });

    if (res.error) {
      toast({
        title: "Add device failed",
        description: res.error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Add device success",
      description: "Device has been added to the room",
      variant: "safe",
    });
    setOpenDialog(false);
  };

  return (
    <Dialog
      open={openDialog}
      onOpenChange={() => {
        formAddDevice.reset();
        setOpenDialog(!openDialog);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex w-fit items-center gap-2 p-16 bg-primary text-neutral-very-light hover:bg-primary-slightly-dark"
        >
          <CirclePlusIcon size={18} color="white" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#FFFFFF] border-none shadow-md p-16">
        <DialogTitle className="flex items-center justify-between">
          <p className="text-20 font-bold text-neutral-very-dark">Add Device</p>
          <XIcon
            size={24}
            color="black"
            className="cursor-pointer p-4 hover:bg-neutral rounded-full"
            onClick={() => setOpenDialog(false)}
          />
        </DialogTitle>
        <Form {...formAddDevice}>
          <form
            onSubmit={formAddDevice.handleSubmit(onHandleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={formAddDevice.control}
              name="device_ids"
              render={({ field: { ...field } }) => (
                <FormItem className="mb-5">
                  <FormLabel>Devices</FormLabel>
                  <MultiSelect
                    selected={field.value.map(String)}
                    options={deviceIds}
                    {...field}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={formAddDevice.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formAddDevice.control}
              name="room_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="p-16 bg-primary text-neutral-very-light hover:bg-primary-slightly-dark flex items-center justify-items-center w-full"
            >
              Add device
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
