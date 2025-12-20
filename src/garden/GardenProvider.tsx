'use client'

import { createContext, PropsWithChildren, use, useContext, useEffect, useRef, useState } from 'react'
import { GardenWorkerArgs, GardenWorkerProcedures, PlanterArgs } from './GardenWorker'
import { WorkerInterface } from '@/workers/WorkerInterface';

type GardenWorker = WorkerInterface<GardenWorkerProcedures, GardenWorkerArgs>

const GardenContext = createContext<GardenWorker | null>(null);

export function useGarden() {
  const garden = useContext(GardenContext)
  if (garden === null) {
    return
    // throw new Error("useGarden() called with no external provider!")
  }

  return {
    addPlanter: async (p: PlanterArgs) => await garden.call('addPlanter', p, [p.canvas])
  }
}

export default function GardenProvider({
  children,
  ...props
}: PropsWithChildren<GardenWorkerArgs>) {

  const worker = useRef<GardenWorker>(null)
  useEffect(() => {
    worker.current = new WorkerInterface<GardenWorkerProcedures, GardenWorkerArgs>(
      new Worker(
        new URL('./GardenWorker.worker.ts', import.meta.url),
        {type: "module"}),
      props)
    return () => { worker.current && use(worker.current.close()) }
  }, [])

  return (
    <GardenContext.Provider value={worker.current}>
      {children}
    </GardenContext.Provider>
  )
}
