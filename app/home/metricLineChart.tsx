"use client";

import React from "react";
import { format } from "date-fns";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ChartData, normalizeCategorizedData } from "@/lib/normalizeChartData";

export default function MetricLineChart<T extends string>({ data: _data, title, subtitle }: { data: ChartData<T>, title: string, subtitle: string }) {
  const data = normalizeCategorizedData(_data);

  return (
    <div className="grid">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start">
          <p className="text-neutral-very-dark text-24 font-bold">{title}</p>
          <p className="text-neutral-slightly-dark text-16 font-normal">{subtitle}</p>
        </div>
        <div className="bg-neutral py-8 px-4 mr-48 flex items-center justify-between w-192 text-neutral-very-dark text-14 font-normal rounded-lg">
          <ChevronLeftIcon size={16} className="cursor-pointer"/>
          {format(new Date(), "MM/dd/yyyy")}
          <ChevronRightIcon size={16} className="cursor-pointer" />
        </div>
      </div>
      <LineChart
        width={780}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 50,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
      </LineChart>
    </div>
  );
}
