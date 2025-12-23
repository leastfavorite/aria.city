import registerWorker from "@/workers/registerWorker";
import type { GardenLinkProcs, GardenLinkProps } from "./GardenLink";

class GardenLinkImpl {
	canvas: OffscreenCanvas
	buffer: Int32Array

	constructor({ canvas, buffer }: GardenLinkProps) {
		this.canvas = canvas
		this.buffer = buffer

		console.log("Worker!")
	}

	async setCanvas(canvas: OffscreenCanvas) {
	}
}

registerWorker<GardenLinkProcs, GardenLinkProps>(GardenLinkImpl)
