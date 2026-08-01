import { describe, expect, it, vi } from 'vitest'

import { singleFlight } from './singleFlight'

const deferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe('singleFlight', () => {
  it('runs the first call', async () => {
    const gate = { current: false }

    await expect(
      singleFlight({ gate, run: () => Promise.resolve('payload') })
    ).resolves.toBe('payload')
  })

  it('drops a call that arrives while one is in flight', async () => {
    // The second click of a double-click: it must not start a second rebuild,
    // which would open a competing keysign session.
    const gate = { current: false }
    const { promise, resolve } = deferred<string>()
    const run = vi.fn(() => promise)

    const first = singleFlight({ gate, run })
    const second = singleFlight({ gate, run })

    await expect(second).resolves.toBeNull()
    expect(run).toHaveBeenCalledTimes(1)

    resolve('payload')
    await expect(first).resolves.toBe('payload')
  })

  it('allows a new call once the previous one finished', async () => {
    const gate = { current: false }
    const run = vi.fn(() => Promise.resolve('payload'))

    await singleFlight({ gate, run })
    await singleFlight({ gate, run })

    expect(run).toHaveBeenCalledTimes(2)
  })

  it('releases the gate when the run throws, so the button still works', async () => {
    const gate = { current: false }

    await expect(
      singleFlight({ gate, run: () => Promise.reject(new Error('offline')) })
    ).rejects.toThrow('offline')

    expect(gate.current).toBe(false)
  })

  it('holds the gate for the whole run', async () => {
    const gate = { current: false }
    const { promise, resolve } = deferred<string>()

    const inFlight = singleFlight({ gate, run: () => promise })
    expect(gate.current).toBe(true)

    resolve('payload')
    await inFlight

    expect(gate.current).toBe(false)
  })
})
