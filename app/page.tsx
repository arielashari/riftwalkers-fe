'use client'

import dynamic from "next/dynamic";
import FloatingMenu from "@/components/Menu/FloatinMenu";
import PlayerStatus from "@/components/Player/PlayerStatus";
const MapView = dynamic(() => import("@/components/Map/MapView"), {ssr: false});
export default function Home() {
  return (
      <main className={'relative'}>
          <PlayerStatus/>
          <MapView/>
          <FloatingMenu/>
      </main>
  );
}
