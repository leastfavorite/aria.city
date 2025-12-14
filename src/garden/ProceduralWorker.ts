import { init } from "next/dist/compiled/webpack/webpack"

function registerProcedures<P extends Procedures, C>(Procs: new (_: C) => P) {
    let procs: P | null = null;
    let baseProcs: BaseProcedures<C> & Procedures = {
        init: async (args: C) => { procs = new Procs(args) }
    }

    const callProc = <K extends WithBaseKeys<P>>(call: ProcedureCall<P, C, K>) => {


        let procedure;
        if (call.procedure in baseProcs) {
            procedure = baseProcs[call.procedure as keyof BaseProcedures<C>]
        } else if (procs && call.procedure in procs) {
            procedure = procs[call.procedure as keyof Procedures]
        }

        procedure(call.args).then(
            (result) => {
                const response: ProcedureResponse<P, C, K> = {
                    event: 'response',
                    procedure: call.procedure,
                    id: call.id,
                    result: {
                        status: 'success',
                        data: result
                    }
                }
                postMessage(response)
            },
            (error) => {
                const response: ProcedureResponse<P, C, K> = {
                    event: 'response',
                    procedure: call.procedure,
                    id: call.id,
                    result: {
                        status: 'failure',
                        reason: error as string
                    }
                }
                postMessage(response)
            }
        )

    const listener = (e: MessageEvent) => {
        if (e.data.event !== 'call') {
            return;
        }

        const call = e.data as ProcedureCall<P, WithBaseKeys<P>>

        if (call.procedure in baseProcs) {
            callBaseProc(call as keyof BaseProcedures<C>)
        } else {
            callProc(call as ProcedureCall<P, keyof P>)
        }
        callProc(call)
    }
    addEventListener('message', listener)
}

class ProceduralWorker<P extends Procedures<C>, C> {
    public constructor(public procs: WorkerProcedures<P, C>) {
        addEventListener('message', this.onmessage)
    }

    callProcedure<K extends WithBaseKeys<P>>(call: ProcedureCall<P, K>) {
        const procedure = this.procs[call.procedure](call.args) as Promise<ProcResult<P, C, K>>
        procedure.then(
            (result) => {
                const response: ProcedureResponse<P, C, K> = {
                    event: 'response',
                    procedure: call.procedure,
                    id: call.id,
                    result: {
                        status: 'success',
                        data: result
                    }
                }
                postMessage(response)
            },
            (error) => {
                const response: ProcedureResponse<P, C, K> = {
                    event: 'response',
                    procedure: call.procedure,
                    id: call.id,
                    result: {
                        status: 'failure',
                        reason: error as string
                    }
                }
                postMessage(response)
            }
        )
    }

    onmessage(e: MessageEvent) {
        if (e.data.event !== 'call') {
            return;
        }

        const call = e.data as ProcedureCall<P, WithBaseKeys<P>>
        this.callProcedure(call)
    }
}
