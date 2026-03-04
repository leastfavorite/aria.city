'use client';

import { RefObject, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import Header from "@/components/Header/index";
import FancyText from "@/components/FancyText";

export default function Page() {
  const container = useRef<HTMLElement>(null) as RefObject<HTMLElement>;

  return (<>
    <Header />
    <main ref={container}>
      <Canvas
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}
        eventSource={container}
      >
        <View.Port />
      </Canvas>
    </main>
  </>);
}
