class WorkerInterface<C, P extends Procedures> {
  worker: Worker
  promises: Promises<P>
  eventQueue: [WorkerEvent<P, C>, Transferable[]][]
  running: boolean

  constructor(url: URL, args: C, transferables: Transferable[] = []) {
    this.worker = new Worker(url)
    this.promises = {}
    this.eventQueue = []
    this.running = false

    this.worker.addEventListener('message', (e: MessageEvent) => {
      const evt = e.data as WorkerEvent<P, C>
      switch (evt.type) {
        case 'response':
          this.resolveResponse(evt)
          break
        case 'status':
          if (!this.running && evt.running) {
            for (const [e, transferables] of this.eventQueue) {
              this.emitEvent(e, transferables)
            }
            this.eventQueue = []
          }
          this.running = evt.running
          break
        default:
          break
      }
    })

    this.worker.postMessage(args, transferables)
  }

  private emitEvent(e: WorkerEvent<P, C>, transferables: Transferable[] = []) {
    if (this.running) {
      this.worker.postMessage(e, transferables)
    } else {
      this.eventQueue.push([e, transferables])
    }
  }

  private resolveResponse<K extends keyof P>(resp: ResponseEvent<P, K>): boolean {
    const proc = resp.proc

    if (!(proc in this.promises)) {
      return false
    }

    const promiseArr = this.promises[proc]!
    const len = promiseArr.length
    promiseArr.filter(({ id, resolve, reject }) => {
      if (id === resp.id) {
        if (resp.result.success) {
          resolve(resp.result.data)
        } else {
          reject(resp.result.reason)
        }
        return false
      }
      return true
    })

    return promiseArr.length < len
  }

  async close() {
    this.worker.terminate()

    for (const promises of Object.values(this.promises)) {
      for (const promise of promises as PromiseContainer<P, keyof P>[]) {
        promise.reject('Connection terminated')
      }
    }

    this.promises = {}
  }

  call<K extends keyof NoArgProcs<P>>(proc: K): Promise<ProcResult<P, K>>
  call<K extends keyof ArgProcs<P>>(
    proc: K,
    args: ProcArgs<P, K>,
    transferables?: Transferable[],
  ): Promise<ProcResult<P, K>>
  call<K extends keyof P>(
    proc: K,
    args?: ProcArgs<P, K>,
    transferables: Transferable[] = [],
  ): Promise<ProcResult<P, K>> {
    const id = Math.random()
    this.emitEvent({ type: 'call', proc, id, args }, transferables)

    return new Promise((resolve, reject) => {
      const container: PromiseContainer<P, K> = { id, resolve, reject }

      if (!(proc in this.promises)) {
        this.promises[proc] = [container]
      } else {
        this.promises[proc]!.push({ id, resolve, reject })
      }
    })
  }
}
