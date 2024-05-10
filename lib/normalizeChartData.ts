export type ChartData<T extends string> = {
  [category in T]: {
    timestamp: number;
    value: number;
  }[];
};

export function normalizeCategorizedData<T extends string>(data: ChartData<T>): ({ [key in T]: number } & Record<"timestamp", number>)[] {
  const timestampMap: { [timestamp: number]: { [key in T]: number } } = {};
  Object.keys(data)
        .flatMap((key) => ({ ...data[key as T], key }))
        .forEach(({ timestamp, value, key }: any) => {
          if (!(timestamp in timestampMap)) {
            timestampMap[timestamp] = {} as any;
          }
          (timestampMap[timestamp] as any)[key] = value;
        } );

  const res = Object.keys(timestampMap)
                    .map((timestamp) => ({ timestamp: parseInt(timestamp, 10), ...timestampMap[timestamp as any as number]}));
  res.sort((a, b) => a.timestamp - b.timestamp);

  Object.keys(data)
        .forEach((key) => {
          if (!(key in res[0])) {
            (res[0] as any)[key] = 0;
          }
        });

  for (let i = 1; i < res.length; ++i) {
    Object.keys(data)
          .forEach((key) => {
            if (!(key in res[i])) {
              (res[i] as any)[key] = (res[i - 1] as any)[key];
            }
          });
  }

  return res;
}
