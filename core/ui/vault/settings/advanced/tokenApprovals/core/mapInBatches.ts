import { toBatches } from '@vultisig/lib-utils/array/toBatches'

/** How many 1inch or RPC requests the approvals lookup keeps in flight. */
export const concurrentRequests = 5

type MapInBatchesInput<T, R> = {
  items: T[]
  batchSize: number
  map: (item: T) => Promise<R>
}

/**
 * Maps items through an async function, at most `batchSize` at a time, so a
 * large wallet does not fire hundreds of requests at once.
 */
export const mapInBatches = async <T, R>({
  items,
  batchSize,
  map,
}: MapInBatchesInput<T, R>): Promise<R[]> => {
  const results: R[] = []
  for (const batch of toBatches(items, batchSize)) {
    results.push(...(await Promise.all(batch.map(map))))
  }
  return results
}
