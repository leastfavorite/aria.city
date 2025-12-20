'use client'

import { use, useEffect, useId, useRef } from 'react'
import { useGarden } from './GardenProvider'

export interface PlanterProps {
  key: string
}
export default function Planter({ key }: PlanterProps) {
  const id = useId()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const garden = useGarden()

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const offscreen = canvas.transferControlToOffscreen()
      garden && use(garden.addPlanter({ key: id, canvas: offscreen }))
    }
  }, [garden, canvasRef])

  return <canvas ref={canvasRef} width={50} height={50} />
}
