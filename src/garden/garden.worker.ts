const glTarget: OffscreenCanvas = new OffscreenCanvas(50, 50);
const glCtx = glTarget.getContext('webgl2')!

let renderTarget: OffscreenCanvas;
let renderCtx: OffscreenCanvasRenderingContext2D;
let renderBuf: SharedArrayBuffer = new SharedArrayBuffer(8 * 8);

interface WorkerInterface {
	'setCanvas': (o: OffscreenCanvas) => SharedArrayBuffer
}

addEventListener('message', (e: MessageEvent) => {
})
