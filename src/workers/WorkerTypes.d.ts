type Procedures = { [key: string]: (args: any) => Promise<unknown> }

type WorkerObject<P extends Procedures, C> = new (_: C) => P

type ProcArgs<P extends Procedures, K extends keyof P> = P[K] extends (_: infer Args) => infer _
  ? Args
  : never
type ProcResult<P extends Procedures, K extends keyof P> = P[K] extends (
  _: infer _,
) => Promise<infer Result>
  ? Result
  : never

type NoArgProcs<P extends Procedures> = {
  [K in keyof P]: P[K] extends (_: void) => infer _ ? true : never
}
type ArgProcs<P extends Procedures> = {
  [K in keyof P]: P[K] extends (_: void) => infer _ ? never : true
}

type CallEvent<P extends Procedures, K extends keyof P = keyof P> = {
  type: 'call'
  proc: K
  id: number
  args?: ProcArgs<P, K>
}

type ResponseEvent<P extends Procedures, K extends keyof P = keyof P> = {
  type: 'response'
  proc: K
  id: number
  result:
    | {
        success: true
        data: ProcResult<P, K>
      }
    | {
        success: false
        reason: any
      }
}

type StatusEvent = {
  type: 'status'
  running: boolean
}
type InitEvent<C> = {
  type: 'init'
  args: C
}

type WorkerEvent<P extends Procedures, C> =
  | CallEvent<P>
  | InitEvent<C>
  | ResponseEvent<P>
  | StatusEvent

type PromiseContainer<P extends Procedures, K extends keyof P> = {
  id: number
  resolve: (result: ProcResult<P, K>) => void
  reject: (reason?: any) => void
}

type Promises<P extends Procedures> = { [K in keyof P]?: PromiseContainer<P, K>[] }
