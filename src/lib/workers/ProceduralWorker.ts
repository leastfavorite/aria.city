export default function registerWorker<P extends Procedures, C>(constructor: WorkerObject<P, C>) {
  let p: P | null = null

  const emitEvent = (e: WorkerEvent<P, C>) => {
    postMessage(e)
  }

  const resolveCall = <K extends keyof P>(evt: CallEvent<P, K>) => {
    if (!p) {
      console.error('procedure called before worker started')
      return
    }

    p[evt.proc](evt.args).then(
      (rawResult: any) => {
        const result = rawResult as ProcResult<P, K>
        emitEvent({
          type: 'response',
          proc: evt.proc,
          id: evt.id,
          result: {
            success: true,
            data: result,
          },
        })
      },
      (error: any) => {
        emitEvent({
          type: 'response',
          proc: evt.proc,
          id: evt.id,
          result: {
            success: false,
            reason: error,
          },
        })
      },
    )
  }

  addEventListener('message', (e: MessageEvent) => {
    const evt = e.data as WorkerEvent<P, C>
    switch (evt.type) {
      case 'init':
        p = new constructor(evt.args)
        emitEvent({
          type: 'status',
          running: true,
        })
        break
      case 'call':
        resolveCall(evt)
        break
      default:
        break
    }
  })
}
