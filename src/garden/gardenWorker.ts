export interface GardenWorkerArgs {
    simSize: number
}

export interface PlanterArgs {
    key: string
    canvas: OffscreenCanvas
}


interface Planter {
    key: string
    canvas: OffscreenCanvas
    ctx: OffscreenCanvasRenderingContext2D
}

export type GardenWorkerProcedures = {
    addPlanter: (_: PlanterArgs) => Promise<void>,
    removePlanter: (key: string) => Promise<void>
}

export class GardenWorker implements GardenWorkerProcedures {
    settings: GardenWorkerArgs
    canvas: OffscreenCanvas
    planters: Planter[]
    animationFrame: number
    prevTime: number

    constructor(settings: GardenWorkerArgs) {
        this.settings = settings
        this.canvas = new OffscreenCanvas(settings.simSize, settings.simSize)
        this.planters = []
        this.animationFrame = requestAnimationFrame(this.frameLoop)

        this.prevTime = -1
    }

    frameLoop(time: number) {
        const dt = this.prevTime == -1 ? 0 : time - this.prevTime
        this.prevTime = time

        this.update(dt)
        this.render()
    }

    update(dt: number) {
    }

    render() {
        for (const planter of this.planters) {
            const w = planter.canvas.width;
            const h = planter.canvas.height;
            planter.ctx.fillStyle = "red";
            planter.ctx.fillRect(0, 0, w, h);
        }
    }

    async addPlanter({ key, canvas }: PlanterArgs) {
        this.planters.push({
            key,
            canvas,
            ctx: canvas.getContext('2d')!
        })

        this.canvas.width = this.settings.simSize * this.planters.length
    }

    async removePlanter(removeKey: string) {
        this.planters.filter(({ key }: Planter) => key !== removeKey)

        this.canvas.width = this.settings.simSize * this.planters.length
    }
}
