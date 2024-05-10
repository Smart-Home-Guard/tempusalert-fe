"use client";

import React from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const data = [
  {
    name: "Page A",
    CO: 4000,
    Smoke: 2400,
    Flame: 2400,
    LPG: 4000,
  },
  {
    name: "Page B",
    CO: 3000,
    Smoke: 1398,
    Flame: 2210,
    LPG: 1398,
  },
  {
    name: "Page C",
    CO: 2000,
    Smoke: 9800,
    Flame: 2290,
    LPG: 2290,
  },
  {
    name: "Page D",
    CO: 2780,
    Smoke: 3908,
    Flame: 2000,
    LPG: 2780,
  },
  {
    name: "Page E",
    CO: 1890,
    Smoke: 4800,
    Flame: 2181,
    LPG: 4800,
  },
  {
    name: "Page F",
    CO: 2390,
    Smoke: 3800,
    Flame: 2500,
    LPG: 2500,
  },
  {
    name: "Page G",
    CO: 3490,
    Smoke: 4300,
    Flame: 2100,
    LPG: 3490,
  },
];

export default function MyChart() {
  return (
    <div className="grid">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start">
          <p className="text-neutral-very-dark text-24 font-bold">CO Concentration</p>
          <p className="text-neutral-slightly-dark text-16 font-normal">(Unit: ppm)</p>
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
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <ReferenceLine y={9800} label="Max" stroke="red" />
        <Line type="monotone" dataKey="CO" stroke="#8884d8" legendType="none" />
        <Line
          type="monotone"
          dataKey="LPG"
          stroke="#82ca9d"
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="Smoke"
          stroke="#eab308"
          legendType="none"
        />
      </LineChart>
    </div>
  );
}
