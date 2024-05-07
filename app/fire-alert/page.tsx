"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlameIcon, ToggleLeftIcon, SprayCanIcon } from "lucide-react";
import { capitalizeFirstLetterAndLowercaseRest } from "@/lib/capitalizeFirstLetterAndLowercaseRest";
import { components } from "@/types/openapi-spec";
import { apiClient } from "@/lib/apiClient";
import { useCallback, useEffect, useState } from "react";

type SensorNotificationStatus = "dangerous" | "safe" | "idle";

export default function HomePage() {
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
    const RoomNameHeader: React.FC<{
      roomName: string;
      status: SensorNotificationStatus;
    }> = ({ roomName, status }) => {
      const RoomStatusTag: React.FC<{
        status: SensorNotificationStatus;
      }> = ({ status }) => {
        let tagStyle = "";

        switch (status) {
          case "safe":
            tagStyle = "bg-safe text-safe-very-light";
            break;
          case "dangerous":
            tagStyle = "bg-danger text-danger-very-light";
            break;
          case "idle":
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
      componentName: components["schemas"]["ComponentType"];
      status: SensorNotificationStatus;
      message?: string[];
    }> = ({ componentName, status, message }) => {
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
        }
      };

      const ComponentStatusTag: React.FC<{
        status: SensorNotificationStatus;
      }> = ({ status }) => {
        let tagStyle = "";

        switch (status) {
          case "safe":
            tagStyle = "bg-safe-very-light text-safe";
            break;
          case "dangerous":
            tagStyle = "bg-danger-very-light text-danger";
            break;
          case "idle":
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
              {status === "dangerous" && <ComponentStatusTag status={status} />}
            </div>

            <div className="font-normal text-14">
              {status !== "dangerous" ? (
                <ComponentStatusTag status={status} />
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
        <RoomNameHeader roomName={roomName} status="dangerous" />
        <div className="flex flex-col gap-2">
          {devices.map(({ id, kind, logs }) => (
            <ComponentStatusCard
              key={id}
              componentName={kind}
              status={logs[0].Disconnect ? "idle" : "safe"}
            />
          ))}
        </div>
      </div>
    );
  };

  const [userRoomData, setUserRoomData] = useState<
    components["schemas"]["ResponseRoom"][]
  >([]);

  const fetchData = useCallback(async () => {
    const response = await apiClient.GET("/api/rooms/", {
      params: {
        query: { email: localStorage.getItem("email")?.slice(1, -1) || "" },
      },
    });
    setUserRoomData(response.data?.GetAllRooms?.value || []);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
