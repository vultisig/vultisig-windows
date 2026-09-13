// @vitest-environment happy-dom
/**
 * Registries built from `lazyViews` are what keep page modules out of the
 * popup's entry chunk (vultisig/vultisig-windows#4918). A view must suspend
 * only until its loader resolves, a view warmed by the prefetcher must render
 * without suspending at all, and a load that failed must surface as an error
 * rather than retry in a loop, while a later load still lets the view render.
 */
import { lazyViews } from '@lib/ui/navigation/lazyViews'
import { act, render, screen } from '@testing-library/react'
import { Component, ComponentType, ReactNode, Suspense } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

const Page = () => <div data-testid="page" />

// Lets React's own `then` handler on the view promise run inside `act`, so
// the retry it schedules is flushed with it.
const flushSettledPromises = () =>
  new Promise(resolve => setTimeout(resolve, 0))

class Boundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? (
      <div data-testid="error" />
    ) : (
      this.props.children
    )
  }
}

const renderView = (View: ComponentType) =>
  render(
    <Suspense fallback={<div data-testid="fallback" />}>
      <View />
    </Suspense>
  )

describe('lazyViews', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('suspends until the loader resolves, then renders the view', async () => {
    const load = deferred<ComponentType>()
    const { views } = lazyViews({ page: () => load.promise })

    renderView(views.page)

    expect(screen.getByTestId('fallback')).toBeTruthy()
    expect(screen.queryByTestId('page')).toBeNull()

    await act(async () => {
      load.resolve(Page)
      await flushSettledPromises()
    })

    expect(await screen.findByTestId('page')).toBeTruthy()
    expect(screen.queryByTestId('fallback')).toBeNull()
  })

  it('renders a prefetched view without suspending or loading twice', async () => {
    const loader = vi.fn(async () => Page)
    const { views, loaders } = lazyViews({ page: loader })

    await loaders.page()
    renderView(views.page)

    expect(screen.getByTestId('page')).toBeTruthy()
    expect(screen.queryByTestId('fallback')).toBeNull()
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('surfaces a failed load in the error boundary and recovers through the shared cache', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const loader = vi
      .fn<() => Promise<ComponentType>>()
      .mockRejectedValueOnce(new Error('chunk missing'))
      .mockResolvedValue(Page)
    const { views, loaders } = lazyViews({ page: loader })
    const View = views.page

    const failed = render(
      <Boundary>
        <Suspense fallback={<div data-testid="fallback" />}>
          <View />
        </Suspense>
      </Boundary>
    )
    await act(flushSettledPromises)

    expect(screen.getByTestId('error')).toBeTruthy()
    expect(loader).toHaveBeenCalledTimes(1)
    failed.unmount()

    // The prefetcher, or any later caller, can load the view again; a fresh
    // mount then renders it without going through the pinned lazy element.
    await loaders.page()
    renderView(View)

    expect(screen.getByTestId('page')).toBeTruthy()
    expect(loader).toHaveBeenCalledTimes(2)
  })

  it('retries a failed load on a mount after the delay, but not on the retry React schedules', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const now = vi.spyOn(Date, 'now').mockReturnValue(10_000)
    const loader = vi
      .fn<() => Promise<ComponentType>>()
      .mockRejectedValueOnce(new Error('chunk missing'))
      .mockResolvedValue(Page)
    const { views } = lazyViews({ page: loader })
    const View = views.page

    const renderInBoundary = () =>
      render(
        <Boundary>
          <Suspense fallback={<div data-testid="fallback" />}>
            <View />
          </Suspense>
        </Boundary>
      )

    const failed = renderInBoundary()
    await act(flushSettledPromises)

    expect(screen.getByTestId('error')).toBeTruthy()
    failed.unmount()

    // Still inside the delay: the pinned element throws again without a new load.
    const tooSoon = renderInBoundary()
    await act(flushSettledPromises)

    expect(screen.getByTestId('error')).toBeTruthy()
    expect(loader).toHaveBeenCalledTimes(1)
    tooSoon.unmount()

    now.mockReturnValue(12_000)
    renderInBoundary()
    await act(flushSettledPromises)

    expect(screen.getByTestId('page')).toBeTruthy()
    expect(loader).toHaveBeenCalledTimes(2)
  })
})
