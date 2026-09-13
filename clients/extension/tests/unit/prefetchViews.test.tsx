// @vitest-environment happy-dom
/**
 * `PrefetchViews` warms the lazy view registry after home has painted
 * (vultisig/vultisig-windows#4918). It must load the priority views first,
 * one per idle period rather than all at once, carry on past a loader that
 * fails, and stop when it is unmounted.
 */
import { PrefetchViews } from '@lib/ui/navigation/PrefetchViews'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let idleCallbacks: IdleRequestCallback[] = []
const cancelIdleCallback = vi.fn()

const runNextIdle = async () => {
  const callback = idleCallbacks.shift()
  callback?.({ didTimeout: false, timeRemaining: () => 50 })
  await new Promise(resolve => setTimeout(resolve, 0))
}

const makeLoaders = (calls: string[], failing: string[] = []) => {
  const loader = (id: string) => async () => {
    calls.push(id)
    if (failing.includes(id)) throw new Error(`${id} failed`)
    return () => null
  }

  return { a: loader('a'), b: loader('b'), c: loader('c') }
}

describe('PrefetchViews', () => {
  beforeEach(() => {
    idleCallbacks = []
    vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => {
      idleCallbacks.push(callback)
      return idleCallbacks.length
    })
    vi.stubGlobal('cancelIdleCallback', cancelIdleCallback)
  })

  afterEach(() => {
    // Unmount before the idle globals go away: the effect cleanup cancels
    // through them.
    cleanup()
    vi.unstubAllGlobals()
    cancelIdleCallback.mockReset()
  })

  it('loads priority views first, one per idle period, then the rest', async () => {
    const calls: string[] = []

    render(<PrefetchViews loaders={makeLoaders(calls)} priority={['c']} />)

    expect(calls).toEqual([])
    expect(idleCallbacks).toHaveLength(1)

    await runNextIdle()
    expect(calls).toEqual(['c'])
    expect(idleCallbacks).toHaveLength(1)

    await runNextIdle()
    expect(calls).toEqual(['c', 'a'])

    await runNextIdle()
    expect(calls).toEqual(['c', 'a', 'b'])
    expect(idleCallbacks).toHaveLength(0)
  })

  it('carries on past a loader that fails', async () => {
    const calls: string[] = []

    render(<PrefetchViews loaders={makeLoaders(calls, ['a'])} />)

    await runNextIdle()
    await runNextIdle()

    expect(calls).toEqual(['a', 'b'])
  })

  it('stops scheduling loads once unmounted', async () => {
    const calls: string[] = []

    const { unmount } = render(<PrefetchViews loaders={makeLoaders(calls)} />)
    unmount()

    expect(cancelIdleCallback).toHaveBeenCalledTimes(1)

    await runNextIdle()
    expect(idleCallbacks).toHaveLength(0)
  })
})
