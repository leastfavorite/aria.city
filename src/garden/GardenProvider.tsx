'use client';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { PlanterProps } from "./Planter";


export interface GardenProviderProps {
    canvasSize: number,
    pixelScale: number
}

const GardenContext = createContext<[Worker | null, () => GardenProviderProps]>(
    [null, () => { throw new Error("useGarden() called without Garden Provider!") }]);

export function useGarden() {
    const [worker, getProps] = useContext(GardenContext)
    const { canvasSize, pixelScale } = getProps();


    const requestPlanter = (canvas: OffscreenCanvas, props: PlanterProps): boolean => {
        if (!worker) return false;

        worker.postMessage({
            event: 'requestPlanter',
            data: {
                canvas: canvas,
                ...props
            }
        }, [canvas])

        return true;
    }

    return {
        canvasSize: canvasSize * pixelScale,
        requestPlanter
    }
}


export default function GardenProvider({ children, ...props }: PropsWithChildren<GardenProviderProps>) {
    const [worker, setWorker] = useState<Worker | null>(null)

    useEffect(() => {
        const webWorker = new Worker(new URL('./gardenWorker.ts', import.meta.url))
        setWorker(webWorker)
        webWorker.postMessage({
            event: 'initialize',
            data: props
        })

        return () => {
            setWorker(null)
            webWorker.postMessage({ event: 'destroy' })
            webWorker.terminate()
        }
    }, [])

    return (
        <GardenContext.Provider value={[worker, () => props]}>
            {children}
        </GardenContext.Provider>
    );
}
