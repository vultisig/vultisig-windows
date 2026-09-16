// @vitest-environment happy-dom
/**
 * The action popup boots in `instant` mode, where `WalletCoreProvider` must
 * not replace the tree while the WASM loads (vultisig/vultisig-windows#4918).
 * Children render at once, anything that asserts WalletCore suspends to its
 * own boundary until the load completes, the WASM is initialised only once
 * no matter how many consumers wait on it, and a failed load ends on an error
 * page that can start the load again.
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { WalletCore } from '@trustwallet/wallet-core'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const initWasm = vi.hoisted(() => vi.fn())

vi.mock('@trustwallet/wallet-core', () => ({ initWasm }))

vi.mock('@core/ui/product/StartupPlaceholder', () => ({
  StartupPlaceholder: () => <div data-testid="placeholder" />,
}))

vi.mock('@core/ui/product/StartupLoadError', () => ({
  StartupLoadError: ({ onRetry }: { onRetry: () => void }) => (
    <button data-testid="load-error" onClick={onRetry} />
  ),
}))

const walletCore = { id: 'wallet-core' } as unknown as WalletCore

const deferredInit = () => {
  let resolve!: (value: WalletCore) => void
  initWasm.mockReturnValue(
    new Promise<WalletCore>(res => {
      resolve = res
    })
  )

  return () => resolve(walletCore)
}

const loadProvider = async () => {
  vi.resetModules()

  return import('@core/ui/chain/providers/WalletCoreProvider')
}

describe('WalletCoreProvider', () => {
  beforeEach(() => {
    initWasm.mockReset()
  })

  it('renders children before the WASM is ready when not blocking', async () => {
    const resolveInit = deferredInit()
    const { WalletCoreProvider, useAssertWalletCore } = await loadProvider()

    const Consumer = () => {
      useAssertWalletCore()
      return <div data-testid="consumer" />
    }

    render(
      <WalletCoreProvider blocking={false}>
        <div data-testid="home" />
        <Suspense fallback={<div data-testid="waiting" />}>
          <Consumer />
        </Suspense>
      </WalletCoreProvider>
    )

    expect(screen.getByTestId('home')).toBeTruthy()
    expect(screen.getByTestId('waiting')).toBeTruthy()
    expect(screen.queryByTestId('placeholder')).toBeNull()

    await act(async () => {
      resolveInit()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('consumer')).toBeTruthy()
    expect(screen.queryByTestId('waiting')).toBeNull()
    expect(initWasm).toHaveBeenCalledTimes(1)
  })

  it('holds the tree on the startup placeholder by default', async () => {
    const resolveInit = deferredInit()
    const { WalletCoreProvider } = await loadProvider()

    render(
      <WalletCoreProvider>
        <div data-testid="home" />
      </WalletCoreProvider>
    )

    expect(screen.getByTestId('placeholder')).toBeTruthy()
    expect(screen.queryByTestId('home')).toBeNull()

    await act(async () => {
      resolveInit()
    })

    expect(await screen.findByTestId('home')).toBeTruthy()
  })

  it('shows an error page whose action loads the WASM again', async () => {
    initWasm.mockRejectedValueOnce(new Error('wasm missing'))
    const { WalletCoreProvider, useAssertWalletCore } = await loadProvider()

    const Consumer = () => {
      useAssertWalletCore()
      return <div data-testid="consumer" />
    }

    render(
      <WalletCoreProvider blocking={false}>
        <Suspense fallback={<div data-testid="waiting" />}>
          <Consumer />
        </Suspense>
      </WalletCoreProvider>
    )

    expect(await screen.findByTestId('load-error')).toBeTruthy()
    expect(screen.queryByTestId('waiting')).toBeNull()
    expect(initWasm).toHaveBeenCalledTimes(1)

    const resolveInit = deferredInit()
    fireEvent.click(screen.getByTestId('load-error'))
    // The package itself is imported on demand, so the init call follows a tick later.
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('waiting')).toBeTruthy()
    expect(initWasm).toHaveBeenCalledTimes(2)

    await act(async () => {
      resolveInit()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('consumer')).toBeTruthy()
  })
})
