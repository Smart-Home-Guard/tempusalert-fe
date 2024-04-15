import "@/styles/globals.css";

import { NavigationBar } from "./navbar";

export default function HomeLayout({ children }: RootLayoutProps) {
  return (
      <div className="flex min-h-screen bg-neutral-light">
        <NavigationBar />
        <div>{ children }</div>
      </div>
  )
}
