"use client";

import dynamic from "next/dynamic";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MyChart = dynamic(() => import("./chart"), { ssr: false });

export default function HomePage() {
  return (
    <div className="grid gap-4 items-center justify-center text-center">
      <Alert className="bg-primary-very-light">
        <AlertTitle className="text-30">Your home is safe</AlertTitle>
      </Alert>
      <Tabs defaultValue="CO" className="w-[900px]">
        <TabsList className="flex items-center gap-4 justify-start">
          <TabsTrigger value="CO">CO</TabsTrigger>
          <TabsTrigger value="Smoke">Smoke</TabsTrigger>
          <TabsTrigger value="Flame">Flame</TabsTrigger>
          <TabsTrigger value="LPG">LPG</TabsTrigger>
        </TabsList>
        <TabsContent value="CO">
          <MyChart />
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}
