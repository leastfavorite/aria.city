"use client";

import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";
import type { GardenProps } from "./InnerGarden";

const InnerGarden = dynamic(() => import('./InnerGarden'), { ssr: false })

export default function Garden({ children, ...props }: PropsWithChildren<GardenProps>) {
  return (
    <InnerGarden {...props}>
      {children}
    </InnerGarden>
  );
}
