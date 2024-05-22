"use client";


import React, { useEffect, useRef } from "react";
import * as Plotly from "plotly.js-dist-min";
import { Data, Layout, Config } from "plotly.js";
interface PlotlyChartProps {
  data: Partial<Data>[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
}
const PlotlyChart: React.FC<PlotlyChartProps> = ({ data, layout, config }) => {
  const ChartClassName = "abc";
  useEffect(() => {
    Plotly.newPlot(ChartClassName, data, layout, config);
  }, [data, layout, config]);
  return <div className={ChartClassName} />;
};
export default PlotlyChart;
