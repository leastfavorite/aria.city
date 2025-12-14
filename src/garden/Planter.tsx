'use client';
import { useEffect, useId, useRef } from "react";
import { useGarden } from "./GardenProvider";


export interface PlanterProps {
    key: string
}
export default function Planter({ ...props }: PlanterProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const garden = useGarden()

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const offscreen = canvas.transferControlToOffscreen()
            garden.requestPlanter(offscreen, { ...props })
        }
    }, [garden, canvasRef])

    return (
        <canvas ref={canvasRef} width={garden.canvasSize} height={garden.canvasSize} />
    );
}
