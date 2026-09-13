import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'
import { useEffect } from 'react'

import { ViewLoaders } from './ViewLoaders'

type PrefetchViewsProps<T extends string> = {
  loaders: ViewLoaders<T>
  /** Loaded first, in this order; every other loader follows in registry order. */
  priority?: T[]
}

const idleTimeoutMs = 2000
const noIdleCallbackDelayMs = 200

const requestIdle = (callback: () => void) => {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(callback, { timeout: idleTimeoutMs })

    return () => cancelIdleCallback(id)
  }

  const id = setTimeout(callback, noIdleCallbackDelayMs)

  return () => clearTimeout(id)
}

const prefetchViews = <T extends string>({
  loaders,
  priority = [],
}: PrefetchViewsProps<T>) => {
  const ids = [
    ...priority,
    ...getRecordKeys(loaders).filter(id => !priority.includes(id)),
  ]

  let isCancelled = false
  let cancelIdle: (() => void) | null = null

  const loadFrom = (index: number) => {
    if (isCancelled || index >= ids.length) return

    cancelIdle = requestIdle(() => {
      cancelIdle = null
      loaders[ids[index]]()
        .catch(() => undefined)
        .then(() => loadFrom(index + 1))
    })
  }

  loadFrom(0)

  return () => {
    isCancelled = true
    cancelIdle?.()
  }
}

/**
 * Loads view modules one at a time during browser idle periods once mounted,
 * so in-session navigation finds them warm without competing with the first
 * paint. Mount it next to the first painted view rather than above the shell's
 * loading gates. A loader that fails is skipped; navigating to that view
 * retries it. Pass stable `loaders` and `priority` references, since a new
 * identity restarts the prefetch from the beginning.
 */
export function PrefetchViews<T extends string>({
  loaders,
  priority,
}: PrefetchViewsProps<T>) {
  useEffect(() => prefetchViews({ loaders, priority }), [loaders, priority])

  return null
}
