"use client";

import React from "react";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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
    </div>
  );
}
