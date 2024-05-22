export type ChartData<T extends string> = {
  [category in T]: {
    timestamp: TimestampType;
    value: number;
    component: number;
    id: number;
    [key: string]: string | number | TimestampType;
  }[];
};

type TimestampType = { nanos_since_epoch: number; secs_since_epoch: number };

export type MetricChartData = {
  roomName: string;
} & ChartLineData;

type ChartLineData = {
  deviceId: number;
  timestamp: number[];
  value: number[];
};

export function normalizeChartData(
  data: ChartData<string>,
  componentRoomMap: Map<number, string>
): MetricChartData[] {
  const metricChartData: Record<string, ChartLineData> = {};

  Object.values(data).forEach((categoryData) => {
    categoryData.forEach(({ timestamp, value, component, id }) => {
      const roomName =
        componentRoomMap.get(component) || `Unknown room ${component}`;
      const millis =
        timestamp.secs_since_epoch * 1000 +
        Math.floor(timestamp.nanos_since_epoch / 1e6);

      if (!metricChartData[roomName]) {
        metricChartData[roomName] = { timestamp: [], value: [], deviceId: 0 };
      }

      metricChartData[roomName].timestamp.push(millis);
      metricChartData[roomName].value.push(value);
      metricChartData[roomName].deviceId = id;
    });
  });

  for (const chartData of Object.values(metricChartData)) {
    quickSort(chartData.timestamp, chartData.value);
  }

  const res: MetricChartData[] = Object.entries(metricChartData).map(
    ([roomName, chartData]) => ({
      ...chartData,
      roomName: roomName,
    })
  );

  return res.filter(({ timestamp }) => timestamp.length > 1);
}

function quickSort(
  arr: number[],
  values: number[],
  left = 0,
  right = arr.length - 1
) {
  if (left >= right) return;

  const pivot = arr[Math.floor((left + right) / 2)];
  let i = left;
  let j = right;

  while (i <= j) {
    while (arr[i] < pivot) i++;
    while (arr[j] > pivot) j--;
    if (i <= j) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      [values[i], values[j]] = [values[j], values[i]];
      i++;
      j--;
    }
  }

  quickSort(arr, values, left, j);
  quickSort(arr, values, i, right);
}
