import { RectReadOnly } from "react-use-measure"

import vertexShaderSrc from './vertex.glsl';
import fragmentShaderSrc from './fragment.glsl';

export interface GardenProps {
}

export default class Garden {
	canvas?: HTMLCanvasElement
	gl?: WebGL2RenderingContext
	frameId?: number

	constructor({}: GardenProps) {

	}

	render() {
		const gl = this.gl
		if (!gl) return;

		// initialize gl
		const triangleVerticies = [
		  // Top middle
		  0.0, 0.5,
		  // Bottom left
		  -0.5, -0.5,
		  // Bottom right
		  0.5, -0.5,
		];
		const triangleGeoCpuBuffer = new Float32Array(triangleVerticies);

		const triangleGeoBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, triangleGeoCpuBuffer, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);


		const compileShader = (src: string, type: number) => {
			const shader = gl.createShader(type)
			if (!shader) {
				console.error("Could not create shader")
				return
			}
			gl.shaderSource(shader, src)
			gl.compileShader(shader)
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			    const errorMessage = gl.getShaderInfoLog(shader);
			    console.error(`Failed to compile vertex shader: ${errorMessage}`);
			    return;
			}

			return shader
		}

		const vertexShader = compileShader(vertexShaderSrc, gl.VERTEX_SHADER)
		const fragmentShader = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER)

		const program = gl.createProgram()
		gl.attachShader(program, vertexShader!);
		gl.attachShader(program, fragmentShader!);
		gl.linkProgram(program)
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		    const errorMessage = gl.getProgramInfoLog(program);
		    console.error(`Failed to link GPU program: ${errorMessage}`);
		    return;
		}

		const vertexPositionAttributeLocation = gl.getAttribLocation(
			program, 'vertexPosition')
		if (vertexPositionAttributeLocation < 0) {
			console.error(`Failed to get attribute location for vertexPosition`);
			return;
		}

		gl.clearColor(0.08, 0.08, 0.08, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(program);

		gl.enableVertexAttribArray(vertexPositionAttributeLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
		gl.vertexAttribPointer(
			vertexPositionAttributeLocation,
			2,
			gl.FLOAT,
			false,
			2 * Float32Array.BYTES_PER_ELEMENT,
			0
		)
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	attachCanvas(canvas: HTMLCanvasElement) {
		this.canvas = canvas
		console.log("attached!")
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
			if (this.gl) {
				this.gl.viewport(0, 0, bounds.width, bounds.height);
				this.render()
			}
		}

	}
}
