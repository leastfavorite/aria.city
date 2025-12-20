import registerWorker from "@/workers/ProceduralWorker";
import { GardenWorker, GardenWorkerArgs, GardenWorkerProcedures } from "./GardenWorker";

registerWorker<GardenWorkerProcedures, GardenWorkerArgs>(GardenWorker)
