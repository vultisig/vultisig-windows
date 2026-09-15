// @vitest-environment happy-dom
/**
 * `MpcEngineGate` is how clients that boot behind a splash wait for the SDK
 * to register the MPC engine now that the SDK is loaded on demand
 * (vultisig/vultisig-windows#4937). Blocking, it must hold the tree until the
 * load resolves and offer a retry when it fails; non-blocking, it must render
 * children at once without starting the load itself.
 */
import { MpcEngineGate } from '@core/ui/mpc/MpcEngineGate'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadMpcEngine = vi.hoisted(() => vi.fn())

vi.mock('@core/ui/mpc/bootstrapMpcEngine', () => ({ loadMpcEngine }))

vi.mock('@core/ui/product/StartupPlaceholder', () => ({
  StartupPlaceholder: () => <div data-testid="placeholder" />,
}))

vi.mock('@core/ui/product/StartupLoadError', () => ({
  StartupLoadError: ({ onRetry }: { onRetry: () => void }) => (
    <button data-testid="load-error" onClick={onRetry} />
  ),
}))

const deferredLoad = () => {
  let resolve!: () => void
  let reject!: (error: unknown) => void
  loadMpcEngine.mockReturnValueOnce(
    new Promise<void>((res, rej) => {
      resolve = res
      reject = rej
    })
  )

  return { resolve, reject }
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0))

describe('MpcEngineGate', () => {
  beforeEach(() => {
    loadMpcEngine.mockReset()
  })

  it('holds the tree until the engine has loaded when blocking', async () => {
    const load = deferredLoad()

    render(
      <MpcEngineGate blocking>
        <div data-testid="app" />
      </MpcEngineGate>
    )

    expect(screen.getByTestId('placeholder')).toBeTruthy()
    expect(screen.queryByTestId('app')).toBeNull()

    await act(async () => {
      load.resolve()
      await settle()
    })

    expect(screen.getByTestId('app')).toBeTruthy()
    expect(loadMpcEngine).toHaveBeenCalledTimes(1)
  })

  it('shows an error page whose action loads the engine again', async () => {
    const failed = deferredLoad()

    render(
      <MpcEngineGate blocking>
        <div data-testid="app" />
      </MpcEngineGate>
    )

    await act(async () => {
      failed.reject(new Error('sdk chunk missing'))
      await settle()
    })

    expect(screen.getByTestId('load-error')).toBeTruthy()

    const retried = deferredLoad()
    fireEvent.click(screen.getByTestId('load-error'))

    expect(screen.getByTestId('placeholder')).toBeTruthy()
    expect(loadMpcEngine).toHaveBeenCalledTimes(2)

    await act(async () => {
      retried.resolve()
      await settle()
    })

    expect(screen.getByTestId('app')).toBeTruthy()
  })

  it('renders children at once and leaves the load to the entry points when not blocking', () => {
    render(
      <MpcEngineGate blocking={false}>
        <div data-testid="app" />
      </MpcEngineGate>
    )

    expect(screen.getByTestId('app')).toBeTruthy()
    expect(loadMpcEngine).not.toHaveBeenCalled()
  })
})
