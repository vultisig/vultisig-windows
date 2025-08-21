type CoalesceOptions<Input> = {
  getKey: (input: Input) => string
  shouldCoalesce?: (input: Input) => boolean
}

/**
 * Coalesces concurrent in-flight executions for identical inputs.
 * While a call with the same key is pending, subsequent calls return the same promise.
 * Once it settles, the entry is removed and the next call will execute again.
 */
export function createInFlightCoalescer<Input, Output>({
  getKey,
  shouldCoalesce,
}: CoalesceOptions<Input>) {
  const inFlight = new Map<string, Promise<Output>>()

  return async (
    input: Input,
    executor: (input: Input) => Promise<Output>
  ): Promise<Output> => {
    if (shouldCoalesce && !shouldCoalesce(input)) {
      return executor(input)
    }

    const key = getKey(input)
    const existing = inFlight.get(key)
    if (existing) return existing

    const promise = executor(input).finally(() => {
      inFlight.delete(key)
    })

    inFlight.set(key, promise)
    return promise
  }
}
