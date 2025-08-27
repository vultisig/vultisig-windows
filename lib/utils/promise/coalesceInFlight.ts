type CoalesceOptions<Args extends any[]> = {
  getKey?: (...args: Args) => string
  shouldCoalesce?: (...args: Args) => boolean
}

/**
 * Coalesces concurrent in-flight executions for identical inputs.
 * While a call with the same key is pending, subsequent calls return the same promise.
 * Once it settles, the entry is removed and the next call will execute again.
 */
export function withInFlightCoalescer<
  T extends (...args: any[]) => Promise<any>,
>(resolver: T, options?: CoalesceOptions<Parameters<T>>): T {
  const getKey =
    options?.getKey ?? ((...args: Parameters<T>) => JSON.stringify(args))
  const shouldCoalesce = options?.shouldCoalesce
  const inFlight = new Map<string, ReturnType<T>>()

  const wrapped = (async (...args: Parameters<T>): Promise<any> => {
    if (shouldCoalesce && !shouldCoalesce(...args)) {
      return resolver(...args)
    }

    const key = getKey(...args)
    const existing = inFlight.get(key)
    if (existing) return existing

    const promise = (resolver(...args) as ReturnType<T>).finally(() => {
      inFlight.delete(key)
    }) as ReturnType<T>

    inFlight.set(key, promise)
    return promise
  }) as T

  return wrapped
}
