import WorkerLink from "@/workers/WorkerLink";

export type GardenLinkProps = {
  canvas: OffscreenCanvas,
  buffer: Int32Array
};

export type GardenLinkProcs = {
  setCanvas: (canvas: OffscreenCanvas) => Promise<void>
}

export default class GardenLink extends WorkerLink<GardenLinkProcs, GardenLinkProps> {
  buffer: Int32Array
  cleanup: () => void

  constructor(parent: HTMLElement) {
    const canvas = document.createElement('canvas')
    parent.appendChild(canvas)

    const offscreen = canvas.transferControlToOffscreen()
    const buffer = new Int32Array(new SharedArrayBuffer(4 * 2))
    super(
      new Worker(new URL('./worker.ts', import.meta.url)),
      { canvas: offscreen, buffer },
      [offscreen]
    )

    this.buffer = buffer
    this.cleanup = () => {
      parent.removeChild(canvas)
    }
  }

  async close() {
    this.cleanup()
    await super.close()
  }

  setSize(w: number, h: number) {
    Atomics.store(this.buffer, 0, w);
    Atomics.store(this.buffer, 1, h);
  }

  setCanvas(canvas: OffscreenCanvas) {
    console.warn('setCanvas called?')
    this.call('setCanvas', canvas, [canvas])
  }
}
