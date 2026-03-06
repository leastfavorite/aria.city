'use client';

import Background from "@/components/Background";
import CanvasProvider from "@/components/CanvasProvider";
import Card from "@/components/Card";
import { CardStack } from "@/components/CardStack";
import Header from "@/components/Header/index";

export default function Page() {

  return (<>
    <Background>
      <CanvasProvider>
        <Header />
        <Card tiltX={20} tiltY={50} />
      </CanvasProvider>
    </Background>
  </>);
}
