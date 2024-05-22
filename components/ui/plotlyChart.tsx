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
  const ChartId = `abc-${Date.now()}`;
  useEffect(() => {
    Plotly.newPlot(ChartId, data, layout, config);
  }, [data, layout, config, ChartId]);
  return <div id={ChartId} />;
};
export default PlotlyChart;
