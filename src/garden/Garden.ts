import { RectReadOnly } from "react-use-measure"

import vertexShaderSrc from './vertex.glsl';
import fragmentShaderSrc from './fragment.glsl';

export interface GardenProps {
}

export interface Garden {
	attachCanvas: (c: HTMLCanvasElement) => (() => void) | undefined,
	resize: (w: number, h: number) => void
}

export default function makeGarden({}: GardenProps): Garden {

	let canvas: HTMLCanvasElement;
	let gl: WebGL2RenderingContext;

	let width = 0;
	let height = 0

	const update = (dt: number) => {
		console.log(dt)
	}

	const resize = (w: number, h: number) => {
		width = w;
		height = h;
	}

	const attachCanvas = (_canvas: HTMLCanvasElement) => {
		canvas = _canvas;

		const _gl = canvas.getContext('webgl2')
		if (!_gl) return;
		gl = _gl

		// initialize gl
		const triangleVertices = [
		  // Top middle
		  0.0, 0.5,
		  // Bottom left
		  -0.5, -0.5,
		  // Bottom right
		  0.5, -0.5,
		];

		const triangleGeoCpuBuffer = new Float32Array(triangleVertices);

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

		const renderFrame = () => {
			canvas.width = width;
			canvas.height = height;

			gl.viewport(0, 0, width, height)
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

		let animationFrame: number;
		let lastTimestamp: number = 0;

		const frameLoop = (currentTimestamp: number) => {
			const dt = lastTimestamp == 0 ? 0 : currentTimestamp - lastTimestamp
			lastTimestamp = currentTimestamp;
			update(dt)
			renderFrame()
			animationFrame = requestAnimationFrame(frameLoop)
		}
		animationFrame = requestAnimationFrame(frameLoop)

		return () => {
			cancelAnimationFrame(animationFrame)
		}
	}

	return {
		attachCanvas,
		resize
	}
}
