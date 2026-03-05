'use client';

import Background from "@/components/Background";
import CanvasProvider from "@/components/CanvasProvider";
import Header from "@/components/Header/index";

export default function Page() {

  return (<>
    <Background>
      <CanvasProvider>
        <Header />
      </CanvasProvider>
    </Background>
  </>);
}
