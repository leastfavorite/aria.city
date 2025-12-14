type Procedures = { [key: string]: (args: any) => Promise<unknown> }

type PromiseContainer<P extends Procedures, C, K extends WithBaseKeys<P>> = {
    id: number
    resolve: (result: ProcResult<P, C, K>) => void
    reject: (reason?: any) => void
}

type WithBaseKeys<P extends Procedures> = (keyof P | keyof BaseProcedures<unknown>)

type WithBase<P extends Procedures, C> =
    { [K in (keyof P | keyof BaseProcedures<C>)]: K extends keyof BaseProcedures<C> ? BaseProcedures<C>[K] : P[K] }

type Promises<P extends Procedures, C> =
    { [K in keyof P]?: PromiseContainer<P, C, K>[] }

type RawProcArgs<P extends Procedures, K extends keyof P> =
    P[K] extends (_: infer Args) => infer _ ? Args : never;
type ProcArgs<P extends Procedures, C, K extends WithBaseKeys<P>> =
    K extends keyof BaseProcedures<C> ? RawProcArgs<BaseProcedures<C>, K> : RawProcArgs<P, K>

type RawProcResult<P extends Procedures, K extends keyof P> =
    P[K] extends (_: infer _) => Promise<infer Result> ? Result : never;
type ProcResult<P extends Procedures, C, K extends WithBaseKeys<P>> =
    K extends keyof BaseProcedures<C> ? RawProcResult<BaseProcedures<C>, K> : RawProcResult<P, K>

type ArglessProcedures<P extends Procedures> =
    { [K in keyof P]: P[K] extends (_: void) => infer _ ? true : never }
type ArgedProcedures<P extends Procedures> =
    { [K in keyof P]: P[K] extends (_: void) => infer _ ? never : true }


type ProcedureResponse<P extends Procedures, C, K extends WithBaseKeys<P>> = {
    event: 'response',
    procedure: K,
    id: number,
    result: {
        status: 'success',
        data: ProcResult<P, C, K>
    } | {
        status: 'failure',
        reason: string
    }
}

type ProcedureCall<P extends Procedures, C, K extends WithBaseKeys<P>> = {
    event: 'call',
    procedure: K,
    id: number,
    args: ProcArgs<P, C, K>
}

type BaseProcedures<C> = {
    init: (args: C) => Promise<void>
}
