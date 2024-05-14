"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FlameIcon,
  ToggleLeftIcon,
  SprayCanIcon,
  ThermometerIcon,
  WindIcon,
  SirenIcon,
  BellRingIcon,
} from "lucide-react";
import { capitalizeFirstLetterAndLowercaseRest } from "@/lib/capitalizeFirstLetterAndLowercaseRest";
import { components } from "@/types/openapi-spec";
import { apiClient } from "@/lib/apiClient";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

type NotificationStatus = "SAFE" | "DANGEROUS" | "IDLE";

export default function HomePage() {
  const [userRoomData, setUserRoomData] = useState<
    components["schemas"]["ResponseRoom"][]
  >([]);

  const Header = () => {
    return (
      <div className="flex flex-row justify-between pt-24 px-24">
        <h1 className="text-30 font-bold">Devices & Rooms</h1>
        <div className="flex flex-row gap-5 pt-16">
          <Button className="bg-neutral-very-light hover:bg-neutral-slightly-light border-[1.5px] border-neutral-slightly-light rounded-none px-16 py-24 text-neutral-very-dark hover:text-neutral-slightly-dark font-normal">
            Mute all
          </Button>
          <Button className="bg-neutral-very-light hover:bg-neutral-slightly-light border-[1.5px] border-neutral-slightly-light rounded-none px-16 py-24 text-neutral-very-dark hover:text-neutral-slightly-dark font-normal">
            Unmute all
          </Button>
        </div>
      </div>
    );
  };

  const RoomStatusInformation: React.FC<{
    roomName: string;
    devices: components["schemas"]["Component"][];
  }> = ({ roomName, devices }) => {
    const [roomStatus, setRoomStatus] = useState<NotificationStatus>("IDLE");

    const RoomNameHeader: React.FC<{
      roomName: string;
      status: NotificationStatus;
    }> = ({ roomName, status }) => {
      const RoomStatusTag: React.FC<{
        status: NotificationStatus;
      }> = ({ status }) => {
        let tagStyle = "";

        switch (status) {
          case "SAFE":
            tagStyle = "bg-safe text-safe-very-light";
            break;
          case "DANGEROUS":
            tagStyle = "bg-danger text-danger-very-light";
            break;
          case "IDLE":
            tagStyle = "bg-warning text-warning-very-light";
            break;
        }

        return (
          <div
            className={`h-fit w-fit leading-small-font py-4 px-8 rounded-md text-14 font-normal capitalize ${tagStyle}`}
          >
            {status}
          </div>
        );
      };

      return (
        <div className="flex gap-2">
          <h5 className="text-20 font-bold text-neutral-very-dark">
            {roomName.slice(0, 1).toUpperCase() +
              roomName.slice(1).toLowerCase()}
          </h5>
          <RoomStatusTag status={status} />
        </div>
      );
    };

    const ComponentStatusCard: React.FC<{
      componentId: number;
      componentKindId: number;
      isIdle: Boolean;
      message?: string[];
    }> = ({ componentId, componentKindId, isIdle, message }) => {
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

      const dangerousInformation = message
        ? message.map(capitalizeFirstLetterAndLowercaseRest).join(", ")
        : "";

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

        const componentStatusResult = (response.data as any)?.value[0].status;

        if (componentStatusResult === 0 || componentStatusResult === 1) {
          const componentStatus: NotificationStatus =
            componentStatusResult === 0 ? "SAFE" : "DANGEROUS";

          if (roomStatus !== "DANGEROUS" && roomStatus !== componentStatus)
            setRoomStatus(componentStatus);

          setComponentStatus(componentStatus);
        } else setComponentStatus("IDLE"); // componentStatusResult is undefined
      }, [componentId, isIdle]);

      useEffect(() => {
        fetchComponentStatus();
      }, [fetchComponentStatus]);

      return (
        <Card className="flex flex-row gap-4 justify-start items-center max-w-80 min-h-28 px-16 py-16 rounded-sm border-neutral-slightly-dark text-neutral-dark">
          <div>
            <ComponentIcon componentName={componentName} />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row gap-2">
              <h5 className="text-20 font-semibold">
                {capitalizeFirstLetterAndLowercaseRest(componentName)}
              </h5>
              {componentStatus === "DANGEROUS" && (
                <ComponentStatusTag status={componentStatus} />
              )}
            </div>

            <div className="font-normal text-14">
              {componentStatus !== "DANGEROUS" ? (
                <ComponentStatusTag status={componentStatus} />
              ) : (
                <div>{dangerousInformation}</div>
              )}
            </div>
          </div>
        </Card>
      );
    };
    return (
      <div className="flex flex-col gap-4">
        <RoomNameHeader roomName={roomName} status={roomStatus} />
        <div className="flex flex-col gap-2">
          {devices.map(({ id, kind, logs }) => (
            <ComponentStatusCard
              key={id}
              componentId={id}
              componentKindId={Number(kind)}
              isIdle={logs[0].Disconnect ? true : false}
            />
          ))}
        </div>
      </div>
    );
  };

  const fetchRoomsData = useCallback(async () => {
    const response = await apiClient.GET("/api/rooms/", {
      params: {
        query: { email: localStorage.getItem("email")?.slice(1, -1) || "" },
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

    setUserRoomData((response.data as any)?.value || []);
  }, []);

  useEffect(() => {
    fetchRoomsData();
  }, [fetchRoomsData]);

  return (
    <div className="flex flex-col gap-8">
      <Header />
      <div className="pl-24 flex flex-row gap-8 overflow-x-auto">
        {userRoomData.map(({ name, devices }) =>
          devices.map(({ id, components }) => (
            <RoomStatusInformation
              key={id}
              roomName={name}
              devices={components}
            />
          ))
        )}
      </div>
    </div>
  );
}
