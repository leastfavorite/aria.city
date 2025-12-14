class WorkerInterface<P extends Procedures, C> {

    worker: Worker
    promises: Promises<P, C>

    private resolveResponse<K extends WithBaseKeys<P>>(response: ProcedureResponse<P, C, K>): boolean {
        const proc = response.procedure;

        if (!(proc in this.promises)) {
            return false
        }

        const promiseArr = this.promises[proc]!
        const len = promiseArr.length;
        promiseArr.filter(({ id, resolve, reject }) => {
            if (id === response.id) {
                if (response.result.status === 'success') {
                    resolve(response.result.data)
                } else {
                    reject(response.result.reason)
                }
                return false;
            }
            return true;
        })

        return promiseArr.length < len
    }

    constructor(url: URL) {
        this.worker = new Worker(url)
        this.promises = {}

        this.worker.addEventListener('message', (e: MessageEvent) => {
            if (e.data.event !== 'response') return;
            this.resolveResponse(e.data)

        })
    }

    static async new<P extends Procedures, C>(url: URL, args: C) {
        const result = new WorkerInterface<P, C>(url)
        await result.expect('init', args)
        return result
    }

    async close() {
        await this.expect('close')
        this.worker.terminate()

        for (const [_, promises] of Object.entries(this.promises) as [WithBaseKeys<P>, PromiseContainer<P, C, WithBaseKeys<P>>[]][]) {
            for (const promise of promises) {
                promise.reject('Connection terminated')
            }
        }

        this.promises = {}
    }

    expect<K extends keyof ArglessProcedures<WithBase<P, C>>>(event: K):
        Promise<ProcResult<P, C, K>>
    expect<K extends keyof ArgedProcedures<WithBase<P, C>>>(
        event: K,
        data: ProcArgs<P, C, K>,
        transferables?: Transferable[]):
            Promise<ProcResult<P, C, K>>
    expect<K extends keyof WithBase<P, C>>(
        event: K,
        data?: ProcArgs<P, C, K>,
        transferables: Transferable[] = []):
            Promise<ProcResult<P, C, K>>
    {
        const id = Math.random()
        this.worker.postMessage({ event, id, data }, transferables)

        return new Promise((resolve, reject) => {
            const container: PromiseContainer<P, C, K> = { id, resolve, reject }

            if (!(event in this.promises)) {
                this.promises[event] = [container]
            } else {
                this.promises[event]!.push({ id, resolve, reject })
            }
        })
    }

}
