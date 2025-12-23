'use client';

import { createContext, PropsWithChildren, Ref, useEffect, useMemo, useRef } from "react";
import { mergeRefs } from "react-merge-refs";
import useMeasure from "react-use-measure";
import Garden, { GardenProps } from "@/garden/Garden";

import style from './style.module.css';

export const GardenContext = createContext<Garden>(null);

export default function GardenProvider({children, ...props}: PropsWithChildren<GardenProps>) {
    const garden = useMemo(() => new Garden(props), [props]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [boundsRef, bounds] = useMeasure({ debounce: 1/60 });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            garden.attachCanvas(canvas)
            return () => garden.detachCanvas()
        }
    }, [canvasRef, garden])

    useEffect(() => {
        garden.setSize(bounds)
    }, [bounds, garden])

    return (
        <GardenContext.Provider value={garden}>
            <div className={style.container} ref={mergeRefs([containerRef, boundsRef as Ref<HTMLDivElement>])}>
                <canvas ref={canvasRef}></canvas>
            </div>
                {children}
        </GardenContext.Provider>
    )
}
