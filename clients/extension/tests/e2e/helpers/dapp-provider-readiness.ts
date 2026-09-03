/** Diagnostics for account reads only. A successful retry never passes a failed original call. */
export type RequestOutcome<T> =
  | { state: 'resolved'; value: T }
  | { state: 'rejected'; error: string }
  | { state: 'pending' }

export type ReadinessReceipt<T> = {
  version: 1
  sourceOrigin: string
  revision: string
  requestName: string
  providerInjection: RequestOutcome<void>
  popupClosure: RequestOutcome<void>
  requestAtPopupClosure: RequestOutcome<T>
  original: RequestOutcome<T>
  recovery: { attempted: boolean; result: RequestOutcome<T> }
  verdict: 'PASS' | 'FAIL'
}

type AccountRead<T> = {
  sourceOrigin: string
  revision: string
  requestName: 'eth_requestAccounts' | 'xrpl.getAddress'
  currentOrigin: () => string
  waitForInjection: () => Promise<void>
  request: () => Promise<T>
  approveAndWaitForClose: (
    signal: AbortSignal,
    timeoutMs: number
  ) => Promise<void>
  reload: () => Promise<void>
  injectionTimeoutMs?: number
  approvalTimeoutMs?: number
  responseTimeoutMs?: number
  recover?: boolean
}

function observe<T>(operation: (signal: AbortSignal) => Promise<T>) {
  const controller = new AbortController()
  let state: RequestOutcome<T> = { state: 'pending' }
  // Attach a rejection handler immediately, including for synchronous throws.
  const completion = Promise.resolve()
    .then(() => operation(controller.signal))
    .then(
      value => {
        state = { state: 'resolved', value }
      },
      error => {
        state = {
          state: 'rejected',
          error: error instanceof Error ? error.message : String(error),
        }
      }
    )
  return {
    completion,
    snapshot: () => ({ ...state }),
    cancel: () => controller.abort(),
  }
}

async function within<T>(
  request: ReturnType<typeof observe<T>>,
  timeoutMs: number
) {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      request.completion,
      new Promise<void>(resolve => {
        timer = setTimeout(() => {
          request.cancel()
          resolve()
        }, timeoutMs)
      }),
    ])
    return request.snapshot()
  } finally {
    clearTimeout(timer)
  }
}

export async function observeDappAccountRead<T>(
  input: AccountRead<T>
): Promise<ReadinessReceipt<T>> {
  const {
    injectionTimeoutMs = 10_000,
    approvalTimeoutMs = 20_000,
    responseTimeoutMs = 10_000,
  } = input
  for (const timeout of [
    injectionTimeoutMs,
    approvalTimeoutMs,
    responseTimeoutMs,
  ]) {
    if (!Number.isFinite(timeout) || timeout <= 0)
      throw new Error('Readiness timeouts must be finite and positive')
  }
  const origin = new URL(input.sourceOrigin)
  if (
    !['http:', 'https:'].includes(origin.protocol) ||
    origin.origin !== input.sourceOrigin
  ) {
    throw new Error('Readiness requires an exact HTTP(S) source origin')
  }
  const checkOrigin = () => {
    if (input.currentOrigin() !== input.sourceOrigin)
      throw new Error('DApp origin changed; account read recovery refused')
  }
  const receipt: ReadinessReceipt<T> = {
    version: 1,
    sourceOrigin: input.sourceOrigin,
    revision: input.revision,
    requestName: input.requestName,
    providerInjection: { state: 'pending' },
    popupClosure: { state: 'pending' },
    requestAtPopupClosure: { state: 'pending' },
    original: { state: 'pending' },
    recovery: { attempted: false, result: { state: 'pending' } },
    verdict: 'FAIL',
  }
  receipt.providerInjection = await within(
    observe(async () => {
      checkOrigin()
      await input.waitForInjection()
      checkOrigin()
    }),
    injectionTimeoutMs
  )
  if (receipt.providerInjection.state !== 'resolved') return receipt

  const original = observe(async () => {
    checkOrigin()
    const value = await input.request()
    checkOrigin()
    return value
  })
  receipt.popupClosure = await within(
    observe(signal => input.approveAndWaitForClose(signal, approvalTimeoutMs)),
    approvalTimeoutMs
  )
  receipt.requestAtPopupClosure = original.snapshot()
  if (receipt.popupClosure.state !== 'resolved') {
    receipt.original = original.snapshot()
    return receipt
  }
  receipt.original = await within(original, responseTimeoutMs)
  if (receipt.original.state === 'resolved') {
    receipt.verdict = 'PASS'
    return receipt
  }
  // Rejections are terminal. Only a pending read with a completed grant can
  // collect one same-origin retry, under one deadline covering reload + read.
  if (receipt.original.state === 'pending' && input.recover) {
    receipt.recovery.attempted = true
    receipt.recovery.result = await within(
      observe(async signal => {
        checkOrigin()
        await input.reload()
        signal.throwIfAborted()
        checkOrigin()
        await input.waitForInjection()
        signal.throwIfAborted()
        checkOrigin()
        const value = await input.request()
        signal.throwIfAborted()
        checkOrigin()
        return value
      }),
      responseTimeoutMs
    )
  }
  // The original snapshot is immutable even if reload rejects its old execution
  // context or the late original resolves while recovery is running.
  return receipt
}
