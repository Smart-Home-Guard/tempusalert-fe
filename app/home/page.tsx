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
  BellRingIcon,
  ChevronDownIcon,
  CirclePlusIcon,
  CircleMinusIcon,
  FlameIcon,
  LightbulbIcon,
  LightbulbOffIcon,
  ShieldCheckIcon,
  SirenIcon,
  SprayCanIcon,
  ThermometerIcon,
  ToggleLeftIcon,
  Volume2Icon,
  VolumeXIcon,
  WindIcon,
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
import { components } from "@/types/openapi-spec";
import { capitalizeFirstLetterAndLowercaseRest } from "@/lib/capitalizeFirstLetterAndLowercaseRest";
import { NotificationStatus } from "./fire-alert/page";

const MetricHistoryChart = dynamic(() => import("./metricLineChart"), {
  ssr: false,
});

export type MetricType = "co" | "smoke" | "flame" | "gas";

enum MetricStatus {
  safe,
  dangerous,
  idle,
}

type RoomStatus = {
  name: string;
  components: {
    id: number;
    kind: number;
    status: number;
    deviceId: number;
  }[];
};

export default function HomePage() {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);

  const { toast } = useToast();
  const { email } = useEmailStore();
  const { jwt } = useJwtStore();

  const fetchRoomStatus = useCallback(async () => {
    const roomsDataRes = await apiClient.GET("/api/rooms/", {
      params: {
        query: {
          email,
        },
      },
      headers: {
        jwt,
      },
    });

    if (roomsDataRes.error) {
      toast({
        title: "Fetch room names failed",
        description: roomsDataRes.error.message,
        variant: "destructive",
      });
      return;
    }

    const roomsData = roomsDataRes.data
      .value as components["schemas"]["ResponseRoom"][];

    const roomStatusRes = await Promise.all(
      roomsData.map(({ name }) =>
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

    const componentsStatuses: Map<number, number> = new Map<number, number>();

    roomStatusRes.forEach((res) => {
      const componentStatuses = (res.data as any)
        .component_statuses as components["schemas"]["ComponentSafetyStatus"][];
      componentStatuses.forEach(({ id, status }) => {
        componentsStatuses.set(id, Number(status));
      });
    });

    const updatedRoomsData = roomsData.map(({ name, devices }) => ({
      name,
      components: devices
        .map(({ id: deviceId, components }) =>
          components.map(({ id, kind }) => ({
            id,
            deviceId,
            kind: Number(kind),
            status: componentsStatuses.get(id) || MetricStatus.idle,
          }))
        )
        .flat(),
    }));

    setRooms(updatedRoomsData);
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
    isSafe: room.components.every(
      (component) =>
        component.status === MetricStatus.safe ||
        component.status === MetricStatus.idle
    ),
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

  const ComponentStatusCard: React.FC<{
    componentId: number;
    deviceId: number;
    componentKindId: number;
    isIdle: Boolean;
  }> = ({ componentId, deviceId, componentKindId, isIdle }) => {
    const componentKindNameMap: Map<
      number,
      components["schemas"]["ComponentType"]
    > = new Map([
      [50, "Smoke"],
      [51, "Heat"],
      [52, "CO"],
      [53, "LPG"],
      [54, "Fire"],
      [55, "FireButton"],
      [56, "FireLight"],
      [57, "FireBuzzer"],
    ]);
    const LightKindList = [56];
    const BuzzerKindList = [57];
    const componentName = componentKindNameMap.get(componentKindId)!;

    const [componentStatus, setComponentStatus] =
      useState<NotificationStatus>("IDLE");

    const ComponentIcon: React.FC<{
      componentName: components["schemas"]["ComponentType"];
    }> = ({ componentName }) => {
      switch (componentName) {
        case "Fire":
          return <FlameIcon size={48} />;
        case "FireButton":
          return <ToggleLeftIcon size={48} />;
        case "LPG":
          return <SprayCanIcon size={48} />;
        case "Heat":
          return <ThermometerIcon size={48} />;
        case "Smoke":
          return <WindIcon size={48} />;
        case "FireBuzzer":
          return <BellRingIcon size={48} />;
        case "FireLight":
          return <SirenIcon size={48} />;
        case "CO":
          return <WindIcon size={48} />;
        case "GeneralBuzzer":
          return <BellRingIcon size={48} />;
        case "GeneralLight":
          return <SirenIcon size={48} />;
      }
    };

    const ComponentStatusTag: React.FC<{
      status: NotificationStatus;
    }> = ({ status }) => {
      let tagStyle = "";

      switch (status) {
        case "SAFE":
          tagStyle = "bg-safe-very-light text-safe";
          break;
        case "DANGEROUS":
          tagStyle = "bg-danger-very-light text-danger";
          break;
        case "IDLE":
          tagStyle = "bg-warning-very-light text-warning";
          break;
      }

      return (
        <div
          className={`h-fit w-fit leading-small-font py-4 px-8 rounded-2xl text-14 font-normal capitalize ${tagStyle}`}
        >
          {status}
        </div>
      );
    };

    const CommandIcons: React.FC<{
      componentId: number;
      componentKindId: number;
      deviceId: number;
    }> = ({ componentId, componentKindId, deviceId }) => {
      const handleClick = async (
        command: components["schemas"]["BuzzerCommand"]
      ) => {
        if (
          !LightKindList.includes(componentKindId) &&
          !BuzzerKindList.includes(componentKindId)
        ) {
          console.warn(`Invalid componentKindId: ${componentKindId}`);
          return;
        }

        const type: "light" | "buzzer" = LightKindList.includes(componentKindId)
          ? "light"
          : "buzzer";

        const response = await apiClient.POST(`/api/remote-control/${type}`, {
          params: {
            query: {
              email: localStorage.getItem("email")?.slice(1, -1) || "",
            },
          },
          body: {
            command,
            component_id: componentId,
            device_id: deviceId,
          },
        });

        if (response.error) {
          toast({
            title: "Send command to component fail",
            description: response.error!.message,
            variant: "destructive",
          });
          return;
        }
        if (response.data) {
          toast({
            title: "Send command to component success",
            variant: "safe",
          });
          return;
        }
      };

      const BuzzerIcons = () => {
        return (
          <div className="flex flex-col gap-2">
            <Volume2Icon
              className="hover:bg-neutral-slightly-light cursor-pointer border"
              size={20}
              onClick={() => handleClick("on")}
            />
            <VolumeXIcon
              className="hover:bg-neutral-slightly-light cursor-pointer border"
              size={20}
              onClick={() => handleClick("off")}
            />
          </div>
        );
      };

      const LightIcons = () => {
        return (
          <div className="flex flex-col gap-2">
            <LightbulbIcon
              className="hover:bg-neutral-slightly-light cursor-pointer border"
              size={20}
              onClick={() => handleClick("on")}
            />
            <LightbulbOffIcon
              className="hover:bg-neutral-slightly-light cursor-pointer border"
              size={20}
              onClick={() => handleClick("off")}
            />
          </div>
        );
      };

      if (LightKindList.includes(componentKindId)) return <LightIcons />;
      if (BuzzerKindList.includes(componentKindId)) return <BuzzerIcons />;
      return <div className="min-w-5"></div>;
    };

    const fetchComponentStatus = useCallback(async () => {
      if (isIdle) {
        setComponentStatus("IDLE");
        return;
      }

      const response = await apiClient.GET("/api/fire-alert/status", {
        params: {
          query: {
            email: localStorage.getItem("email")?.slice(1, -1) || "",
            component_ids: `[${componentId}]`,
          },
        },
      });

      if (response.error) {
        toast({
          title: "Fetch device statuses failed",
          description: response.error!.message,
          variant: "destructive",
        });
        return;
      }

      if ((response.data as any)?.value.length == 0) {
        toast({
          title: "Device not found",
          variant: "destructive",
        });
        return;
      }

      const componentStatusResult = (response.data as any)?.value[0].status;

      if (componentStatusResult === 0 || componentStatusResult === 1) {
        const componentStatus: NotificationStatus =
          componentStatusResult === MetricStatus.safe ? "SAFE" : "DANGEROUS";

        setComponentStatus(componentStatus);
      } else setComponentStatus("IDLE");
    }, [componentId, isIdle]);

    useEffect(() => {
      fetchComponentStatus();
    }, [fetchComponentStatus]);

    return (
      <Card className="flex flex-row gap-4 justify-start items-center max-w-80 min-h-28 px-16 py-16 rounded-sm border-neutral-slightly-dark text-neutral-dark">
        <div>
          <ComponentIcon componentName={componentName} />
        </div>
        <div className="flex flex-col min-w-20">
          <div className="flex flex-col gap-2">
            <h5 className="text-20 font-semibold">
              {capitalizeFirstLetterAndLowercaseRest(componentName)}
            </h5>
            {componentStatus === "DANGEROUS" && (
              <ComponentStatusTag status={componentStatus} />
            )}
          </div>
        </div>
        <CommandIcons
          componentKindId={componentKindId}
          componentId={componentId}
          deviceId={deviceId}
        />
      </Card>
    );
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
            <DialogContent className="bg-[#FFFFFF] border-none shadow-md p-32 overflow-auto w-[1300px] min-w-[1300px] flex flex-col gap-6">
              <DialogTitle className="flex items-center justify-between">
                <p className="text-36 font-bold  text-neutral-very-dark">
                  {room.name}
                </p>
                <div className="flex flex-col gap-2">
                  <DialogAddDevice roomName={room.name} />
                  <DialogRemoveDevice roomName={room.name} />
                </div>
              </DialogTitle>
              <div>
                Device list:{" "}
                {[...new Set(room.components.map(({ deviceId }) => deviceId))]
                  .sort()
                  .join(", ")}
              </div>

              {!room.components.some(
                ({ status }) => status === MetricStatus.dangerous
              ) ? (
                <p>No dangerous were detected by the sensors</p>
              ) : (
                <div className="grid grid-cols-3 max-h-96 overflow-auto">
                  {room.components
                    .filter(({ status }) => status === MetricStatus.dangerous)
                    .map(({ id, kind, deviceId }) => (
                      <ComponentStatusCard
                        key={`${kind}-${id}`}
                        componentId={id}
                        isIdle={false}
                        componentKindId={kind}
                        deviceId={deviceId}
                      />
                    ))}
                </div>
              )}
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
          className="flex w-full items-center gap-2 p-16 bg-primary text-neutral-very-light hover:bg-primary-slightly-dark"
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

function DialogRemoveDevice({ roomName }: { roomName: string }) {
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
    const res = await apiClient.GET("/api/rooms/", {
      params: {
        query: {
          email: email,
          room_name: roomName,
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

    const data = res.data.value as components["schemas"]["ResponseRoom"];

    const deviceIds: OptionType[] =
      data.devices.map((device) => ({
        label: `Device ${device.id}`,
        value: `${device.id}`,
      })) ?? [];
    setDeviceIds(deviceIds);
  }, [email, jwt, roomName, toast]);
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
    const res = await apiClient.DELETE("/api/rooms/devices", {
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
        title: "Remove device failed",
        description: res.error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Remove device success",
      description: "Device has been removed from the room",
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
          className="flex w-full items-center gap-2 p-16 bg-danger text-neutral-very-light hover:bg-danger-slightly-dark"
        >
          <CircleMinusIcon size={18} color="white" />
          Remove Device
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
              className="p-16 bg-danger text-neutral-very-light hover:bg-danger-slightly-dark flex items-center justify-items-center w-full"
            >
              Remove device
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
