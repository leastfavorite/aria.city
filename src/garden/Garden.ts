import { RectReadOnly } from "react-use-measure"

export interface GardenProps {
}

export default class Garden {
	canvas?: HTMLCanvasElement
	gl?: WebGL2RenderingContext
	frameId?: number

	constructor({}: GardenProps) {

	}

	attachCanvas(canvas: HTMLCanvasElement) {
		this.canvas = canvas
		this.gl = canvas.getContext('webgl2')!;
		this.frameId = requestAnimationFrame(this.frameloop.bind(this))
	}

	frameloop() {
		this.frameId = requestAnimationFrame(this.frameloop.bind(this))
	}

	detachCanvas() {
		if (this.frameId) {
			cancelAnimationFrame(this.frameId)
		}
	}

	setSize(bounds: RectReadOnly) {
		if (this.canvas) {
			this.canvas.width = bounds.width;
			this.canvas.height = bounds.height;
		}
	}
}
