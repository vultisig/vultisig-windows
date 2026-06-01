import { WorkerCommand, WorkerResponse } from './keygenWorkerProtocol'

/** Default worker count — balances parallelism against extension-popup memory
 * (each worker holds its own DKLS + Schnorr WASM instance). See issue #3754. */
export const defaultKeygenWorkerPoolSize = 4

type PendingRequest = {
  resolve: (result: unknown) => void
  reject: (error: Error) => void
}

/**
 * A single worker plus a serial task queue. A worker's WASM engine is a
 * per-realm singleton and not reentrant, so only one command runs at a time;
 * parallelism comes from spreading commands across multiple workers.
 */
export class WorkerHandle {
  private readonly worker: Worker
  private readonly pending = new Map<number, PendingRequest>()
  private nextRequestId = 0
  private tail: Promise<unknown> = Promise.resolve()

  constructor() {
    this.worker = new Worker(new URL('./keygenWorker.ts', import.meta.url), {
      type: 'module',
    })
    this.worker.addEventListener(
      'message',
      ({ data }: MessageEvent<WorkerResponse>) => {
        const request = this.pending.get(data.requestId)
        if (!request) {
          return
        }
        this.pending.delete(data.requestId)
        if (data.ok) {
          request.resolve(data.result)
        } else {
          request.reject(new Error(data.error))
        }
      }
    )
    this.worker.addEventListener('error', event => {
      const error = new Error(event.message || 'Keygen worker crashed')
      for (const request of this.pending.values()) {
        request.reject(error)
      }
      this.pending.clear()
    })
  }

  run<T>(command: WorkerCommand): Promise<T> {
    const result = this.tail.then(
      () => this.dispatch(command),
      () => this.dispatch(command)
    )
    // Keep the queue moving even if a command rejects.
    this.tail = result.then(
      () => undefined,
      () => undefined
    )
    // Single worker-boundary cast: the wire protocol carries the result as
    // `unknown`; the caller knows the concrete type for its command.
    return result as Promise<T>
  }

  private dispatch(command: WorkerCommand): Promise<unknown> {
    const requestId = this.nextRequestId++
    return new Promise((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject })
      this.worker.postMessage({ requestId, command })
    })
  }

  terminate() {
    this.worker.terminate()
  }
}

/**
 * Fixed pool of keygen workers. Callers pin a protocol to a worker index so the
 * prepare and exchange phases of the same protocol land on the same realm (the
 * WASM session created during setup is reused by the exchange).
 */
export class KeygenWorkerPool {
  private readonly handles: WorkerHandle[]

  constructor(size: number = defaultKeygenWorkerPoolSize) {
    this.handles = Array.from({ length: size }, () => new WorkerHandle())
  }

  get size(): number {
    return this.handles.length
  }

  run<T>(workerIndex: number, command: WorkerCommand): Promise<T> {
    return this.handles[workerIndex % this.handles.length].run<T>(command)
  }

  terminate() {
    for (const handle of this.handles) {
      handle.terminate()
    }
  }
}
