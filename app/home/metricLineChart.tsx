"use client";

import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import { addDays, endOfDay, format, startOfDay, subDays } from "date-fns";

import * as Plotly from "plotly.js-dist-min";
import {
  ChartData,
  MetricChartData,
  normalizeChartData,
} from "@/lib/normalizeChartData";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEmailStore, useJwtStore } from "@/store";
import { MetricType } from "./page";
import { apiClient } from "@/lib/apiClient";
import { toast } from "@/components/ui/use-toast";
import { components } from "@/types/openapi-spec";

type apiFireLog = "smoke-logs" | "fire-logs" | "co-logs" | "gas-logs";

const apiFireLogMap: Record<MetricType, apiFireLog> = {
  smoke: "smoke-logs",
  co: "co-logs",
  flame: "fire-logs",
  gas: "gas-logs",
};

const dangerThresholdsMap: Record<MetricType, number> = {
  smoke: 700,
  co: 100,
  flame: 2.5,
  gas: 100,
};

export default function MetricLineChart<T extends string>({
  data: _data,
  title,
  subtitle,
  metricType,
}: {
  data: ChartData<T>;
  title: string;
  subtitle: string;
  metricType: MetricType;
}) {
  const { jwt } = useJwtStore();
  const { email } = useEmailStore();
  const [data, setData] = useState<MetricChartData[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDecreaseDate = () => {
    setCurrentDate((prevDate) => subDays(prevDate, 1));
  };

  const handleIncreaseDate = () => {
    setCurrentDate((prevDate) => addDays(prevDate, 1));
  };

  const handlePickDate = (event: BaseSyntheticEvent) => {
    setCurrentDate(new Date(event.target.value));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start_time = Math.floor(startOfDay(currentDate).getTime() / 1000);
        const end_time = Math.floor(endOfDay(currentDate).getTime() / 1000);

        const metricDataResponse = await apiClient.GET(
          `/api/fire-alert/${apiFireLogMap[metricType]}`,
          {
            params: {
              query: {
                email,
                start_time,
                end_time,
              },
            },
            headers: {
              jwt,
            },
          }
        );

        const roomsResponse = await apiClient.GET(`/api/rooms/`, {
          params: {
            query: {
              email,
            },
          },
          headers: {
            jwt,
          },
        });

        const err = metricDataResponse.error || roomsResponse.error;
        if (err) {
          toast({
            title: "Fetch room statuses failed",
            description: err.message,
            variant: "destructive",
          });
          return;
        }

        const componentRoomMap = convertToComponentRoomMap(
          (roomsResponse.data.value! ||
            []) as components["schemas"]["ResponseRoom"][]
        );

        const metricData = metricDataResponse.data;

        if ("co_logs" in metricData) {
          const metricChartData = normalizeChartData(
            {
              co_logs: metricData.co_logs || [],
            },
            componentRoomMap
          );
          setData(metricChartData);
        }
        if ("smoke_logs" in metricData) {
          const metricChartData = normalizeChartData(
            {
              smoke_logs: metricData.smoke_logs || [],
            },
            componentRoomMap
          );
          setData(metricChartData);
        }
        if ("gas_logs" in metricData) {
          const metricChartData = normalizeChartData(
            {
              gas_logs: metricData.gas_logs || [],
            },
            componentRoomMap
          );
          setData(metricChartData);
        }
        if ("fire_logs" in metricData) {
          const metricChartData = normalizeChartData(
            {
              fire_logs: metricData.fire_logs || [],
            },
            componentRoomMap
          );
          setData(metricChartData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentDate, email, jwt, metricType]);

  useEffect(() => {
    if (data && data.length > 0) {
      const DANGER_LEVEL = dangerThresholdsMap[metricType];

      const plotData: Plotly.Data[] = data.map(
        ({ roomName, timestamp, value }) => ({
          x: timestamp,
          y: value,
          name: roomName,
          mode: "lines",
          line: { shape: "spline" },
        })
      );

      const dangerLevelBar = {
        x: data[0].timestamp,
        y: new Array(data[0].timestamp.length).fill(DANGER_LEVEL),
        mode: "lines",
        name: "Danger Level",
        line: {
          dash: "dash",
          color: "red",
        },
      };

      plotData.push(dangerLevelBar);

      const { tickvals, ticktext } = generateTimeTicks(data, 8);

      const layout = {
        // title: "Fire Alert Data for One Day",
        xaxis: {
          title: "Time",
          tickformat: ",d",
          tickvals,
          ticktext,
        },
        yaxis: {
          title: "Fire Alert Level",
        },
      };

      Plotly.newPlot("fireMatrixChart", plotData, layout);
    }
  }, [data, metricType]);

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start">
          <p className="text-neutral-very-dark text-24 font-bold">{title}</p>
          <p className="text-neutral-slightly-dark text-16 font-normal">
            {subtitle}
          </p>
        </div>
        <div className="bg-neutral py-8 px-4 mr-48 flex items-center justify-between w-192 text-neutral-very-dark text-14 font-normal rounded-lg">
          <ChevronLeftIcon
            size={16}
            className="cursor-pointer"
            onClick={handleDecreaseDate}
          />
          <input
            type="date"
            value={format(currentDate, "yyyy-MM-dd")}
            onChange={handlePickDate}
            className="bg-neutral cursor-pointer"
          />
          <ChevronRightIcon
            size={16}
            className="cursor-pointer"
            onClick={handleIncreaseDate}
          />
        </div>
      </div>
      {data.length !== 0 ? (
        <div id="fireMatrixChart" className="plotly-chart"></div>
      ) : (
        <div className="w-full flex justify-center items-center">
          {"There's no data to show"}
        </div>
      )}
    </div>
  );
}

function convertToComponentRoomMap(
  data: components["schemas"]["ResponseRoom"][]
): Map<number, string> {
  const componentRoomMap = new Map<number, string>();
  const roomCounts = new Map<string, number>();

  data.forEach((room) => {
    const roomName = room.name;
    let hasMultipleComponents = false;

    room.devices.forEach((device) => {
      const componentIds = new Set<number>();
      for (let i = 0; i < device.components.length; i++) {
        const component = device.components[i];

        if (componentRoomMap.has(component.id)) {
          continue;
        }

        componentIds.add(component.id);

        if (componentIds.size > 1) {
          hasMultipleComponents = true;
          break;
        }
      }

      device.components.forEach((component) => {
        let roomCounter = roomCounts.get(roomName) || 0;
        if (componentRoomMap.has(component.id)) {
          return;
        }

        const finalRoomName = hasMultipleComponents
          ? `${roomName} ${roomCounter}`
          : roomName;

        componentRoomMap.set(component.id, finalRoomName);
        roomCounts.set(roomName, roomCounter + 1);
      });
    });
  });

  return componentRoomMap;
}

function generateTimeTicks(
  data: MetricChartData[],
  numIntervals: number
): {
  tickvals: number[];
  ticktext: string[];
} {
  const { minTimestamp, maxTimestamp } = getMinMaxTimestamp(data);

  const timeRange = maxTimestamp - minTimestamp;
  const interval = timeRange / numIntervals;

  const tickvals = [];
  const ticktext = [];

  for (let i = 0; i <= numIntervals; i++) {
    const tickValue = minTimestamp + i * interval;
    tickvals.push(tickValue);
    ticktext.push(
      new Date(tickValue * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  return { tickvals, ticktext };
}

function getMinMaxTimestamp(chartDataArray: MetricChartData[]): {
  minTimestamp: number;
  maxTimestamp: number;
} {
  if (chartDataArray.length === 0) {
    return { minTimestamp: -1, maxTimestamp: -1 };
  }

  let minTimestamp = chartDataArray[0].timestamp[0];
  let maxTimestamp =
    chartDataArray[0].timestamp[chartDataArray[0].timestamp.length - 1];

  for (const chartData of chartDataArray) {
    const timestamps = chartData.timestamp;
    const numTimestamps = timestamps.length;

    if (timestamps[0] < minTimestamp) {
      minTimestamp = timestamps[0];
    }

    if (timestamps[numTimestamps - 1] > maxTimestamp) {
      maxTimestamp = timestamps[numTimestamps - 1];
    }
  }

  return { minTimestamp, maxTimestamp };
}
