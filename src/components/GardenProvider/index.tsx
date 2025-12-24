'use client';

import { createContext, PropsWithChildren, Ref, useContext, useEffect, useMemo, useRef } from "react";
import { mergeRefs } from "react-merge-refs";
import useMeasure from "react-use-measure";
import makeGarden, { Garden, GardenProps } from "@/garden/Garden";

import style from './style.module.css';

const GardenContext = createContext<Garden | null>(null);

export function useGarden(): Garden {
    const garden = useContext(GardenContext)
    if (!garden) {
        throw new Error("Tried using garden outside of context!")
    }
    return garden
}

export default function GardenProvider({children, ...props}: PropsWithChildren<GardenProps>) {
    const garden = useMemo(() => makeGarden(props), [props]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [boundsRef, bounds] = useMeasure({ debounce: 1/60 });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            return garden.attachCanvas(canvas)
        }
    }, [canvasRef, garden])

    useEffect(() => {
        garden.resize(bounds.width, bounds.height)
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
