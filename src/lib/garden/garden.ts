import { WorkerInterface } from "$lib/workers/WorkerInterface";
import type { GardenWorkerProcedures, GardenWorkerArgs } from "./GardenWorker";
import Worker from './garden.worker?worker'

const garden = new WorkerInterface<GardenWorkerProcedures, GardenWorkerArgs>(
    new Worker(), { simSize: 50 }
)

export default {
    async addPlanter({ canvas }: { canvas: OffscreenCanvas }){
        await garden.call('addPlanter', { canvas, key: "test" })
    }
}
