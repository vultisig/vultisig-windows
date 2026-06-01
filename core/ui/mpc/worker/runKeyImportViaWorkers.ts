import {
  defaultKeygenWorkerPoolSize,
  KeygenWorkerPool,
  WorkerHandle,
} from './KeygenWorkerPool'
import {
  KeyImportProtocolSpec,
  MldsaProtocolSpec,
  WorkerKeyShareResult,
  WorkerMldsaResult,
} from './keygenWorkerProtocol'

type RunKeyImportViaWorkersInput = {
  /** Root + per-chain DKLS/Schnorr protocols. Each is pinned to one worker. */
  keyImportSpecs: KeyImportProtocolSpec[]
  /** Optional ML-DSA keygen — runs on its own dedicated worker, fully parallel. */
  mldsaSpec?: MldsaProtocolSpec
  poolSize?: number
  /** Fired as each key-import protocol's exchange resolves (drives progress UI). */
  onExchangeComplete?: (id: string) => void
  onMldsaComplete?: () => void
}

type RunKeyImportViaWorkersResult = {
  resultsById: Map<string, WorkerKeyShareResult>
  mldsaResult: WorkerMldsaResult | undefined
}

/**
 * Runs a batch key import with one MPC session per Web Worker, giving true
 * parallel keygen across curves AND across chains (issue #3754). Each worker is
 * an isolated realm with its own DKLS/Schnorr WASM instance, so same-curve
 * sessions no longer have to run serially.
 *
 * Two phases are required by the server's `/batch/import` contract: it fetches
 * every setup message before launching any keygen goroutine. So we upload all
 * setups (phase 1) behind a barrier, then run every exchange (phase 2). Within a
 * worker commands run serially (the WASM engine is a per-realm singleton); the
 * win comes from spreading protocols across the pool.
 *
 * Relay I/O location: kept inside each worker. The alternative — proxying every
 * relay message to the main thread — would centralize networking but force large
 * `Uint8Array` payloads across the worker boundary on every round and reintroduce
 * a main-thread bottleneck. Per-worker I/O is simpler and more parallel, and
 * because nothing but small spec/result records cross the boundary there is no
 * copy overhead worth transferring.
 */
export async function runKeyImportViaWorkers({
  keyImportSpecs,
  mldsaSpec,
  poolSize = defaultKeygenWorkerPoolSize,
  onExchangeComplete,
  onMldsaComplete,
}: RunKeyImportViaWorkersInput): Promise<RunKeyImportViaWorkersResult> {
  const pool = new KeygenWorkerPool(poolSize)
  const mldsaHandle = mldsaSpec ? new WorkerHandle() : undefined

  try {
    // Pre-warm each worker's WASM engine with bounded concurrency. Every worker
    // cold-loads its own ~11 MB DKLS/Schnorr WASM; instantiating all of them at
    // once starves the tab and stalls init (issue #3754). Warming a couple at a
    // time gets every engine hot *before* the timing-sensitive relay exchange,
    // so setup uploads land within the joiner's poll window.
    const warmConcurrency = 2
    for (let start = 0; start < pool.size; start += warmConcurrency) {
      const batch = []
      for (
        let w = start;
        w < Math.min(start + warmConcurrency, pool.size);
        w++
      ) {
        batch.push(pool.run(w, { type: 'init' }))
      }
      await Promise.all(batch)
    }

    const mldsaPromise: Promise<WorkerMldsaResult | undefined> =
      mldsaSpec && mldsaHandle
        ? mldsaHandle
            .run<WorkerMldsaResult>({ type: 'mldsa', spec: mldsaSpec })
            .then(result => {
              onMldsaComplete?.()
              return result
            })
        : Promise.resolve(undefined)
    // Mark handled so an early key-import failure can't surface this as an
    // unhandled rejection once we terminate the worker in `finally`.
    mldsaPromise.catch(() => {})

    const assignments = keyImportSpecs.map((spec, index) => ({
      spec,
      workerIndex: index % pool.size,
    }))

    await Promise.all(
      assignments.map(({ spec, workerIndex }) =>
        pool.run(workerIndex, { type: 'prepare', spec })
      )
    )

    const resultsById = new Map<string, WorkerKeyShareResult>()
    await Promise.all(
      assignments.map(({ spec, workerIndex }) =>
        pool
          .run<WorkerKeyShareResult>(workerIndex, {
            type: 'exchange',
            id: spec.id,
          })
          .then(result => {
            resultsById.set(spec.id, result)
            onExchangeComplete?.(spec.id)
          })
      )
    )

    const mldsaResult = await mldsaPromise

    return { resultsById, mldsaResult }
  } finally {
    pool.terminate()
    mldsaHandle?.terminate()
  }
}
