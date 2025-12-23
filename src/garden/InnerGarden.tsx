"use client";

import { PropsWithChildren, Ref, useEffect, useRef } from "react";
import useMeasure from "react-use-measure";
import GardenLink from "./GardenLink";
import { mergeRefs } from "react-merge-refs";
export interface GardenProps {
  pixelScale: number;
}

export default function InnerGarden({ pixelScale, children }: PropsWithChildren<GardenProps>) {
  const [boundsRef, bounds] = useMeasure({ debounce: 50 })
  const containerRef = useRef<HTMLDivElement>(null);

  const linkRef = useRef<GardenLink>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const link = new GardenLink(container)
    linkRef.current = link;
    return () => { link.close() }
  }, [containerRef])

  useEffect(() => {
    const link = linkRef.current;
    if (link) {
      link.setSize(bounds.width, bounds.height)
    }
  }, [bounds])

  return (
    <>
      <div className="container" ref={mergeRefs([containerRef as Ref<HTMLDivElement>, boundsRef])}>
      </div>
      {children}
    </>
  );
}
