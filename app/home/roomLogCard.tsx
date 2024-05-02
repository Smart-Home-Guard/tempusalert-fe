import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

// Sample data
// const currentRoomLog = {
//   fire_log: {
//     id: 0,
//     component: 8,
//     value: 460,
//     alert: 0,
//     timestamp: {
//       secs_since_epoch: 1714466160,
//       nanos_since_epoch: 941885312,
//     },
//   },
//   smoke_log: {
//     id: 0,
//     component: 0,
//     value: 120,
//     alert: 0,
//     timestamp: {
//       secs_since_epoch: 1714488519,
//       nanos_since_epoch: 436725717,
//     },
//   },
//   co_log: {
//     id: 0,
//     component: 4,
//     value: 460,
//     alert: 0,
//     timestamp: {
//       secs_since_epoch: 1714488519,
//       nanos_since_epoch: 438699701,
//     },
//   },
//   heat_log: {
//     id: 2,
//     component: 2,
//     value: 460,
//     alert: 0,
//     timestamp: {
//       secs_since_epoch: 1714488519,
//       nanos_since_epoch: 441271013,
//     },
//   },
//   button_log: {
//     id: 1,
//     component: 10,
//     value: 1,
//     alert: 0,
//     timestamp: {
//       secs_since_epoch: 1714488519,
//       nanos_since_epoch: 443786145,
//     },
//   },
// };

interface Log {
  id: number;
  component: number;
  value: number;
  alert: number;
  timestamp: {
    secs_since_epoch: number;
    nanos_since_epoch: number;
  };
}

interface CurrentRoomLog {
  fire_log: Log;
  smoke_log: Log;
  co_log: Log;
  heat_log: Log;
  button_log: Log;
}

interface RoomLogCardProps {
  roomName: string;
  currentLog: CurrentRoomLog;
}

const RoomLogCard: React.FC<RoomLogCardProps> = ({ roomName, currentLog }) => {
  const LogList: React.FC<{ logName: string; currentValue: number }> = ({
    logName,
    currentValue,
  }) => {
    return (
      <tr className="mx-10">
        <td className="py-2 text-12">{logName}</td>
        <td className="py-2 text-12">{currentValue}</td>
      </tr>
    );
  };
  return (
    <Card className="min-w-44 rounded shadow-lg">
      <div className="text-primary-very-dark rounded-t-sm text-8xl font-semibold text-16 bg-primary-light text-center mb-2">
        {roomName}
      </div>
      <CardContent className="px-8 py-4 min-w-100">
        <table className="w-full">
          <tbody>
            <LogList logName="Fire" currentValue={currentLog.fire_log.value} />
            <LogList
              logName="Smoke"
              currentValue={currentLog.smoke_log.value}
            />
            <LogList logName="CO" currentValue={currentLog.co_log.value} />
            <LogList logName="Heat" currentValue={currentLog.heat_log.value} />
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default RoomLogCard;
