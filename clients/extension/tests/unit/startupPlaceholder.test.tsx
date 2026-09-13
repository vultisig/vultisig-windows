// @vitest-environment happy-dom
/**
 * In `instant` startup mode the shell's loading gates must never show the
 * brand animation (vultisig/vultisig-windows#4918): the placeholder renders a
 * neutral spinner and the splash counts as completed from the first render.
 * The default mode keeps the product logo block.
 */
import { StartupPlaceholder } from '@core/ui/product/StartupPlaceholder'
import {
  StartupSplashProvider,
  useStartupSplash,
} from '@core/ui/product/startupSplash'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@core/ui/product/ProductLogoBlock', () => ({
  ProductLogoBlock: () => <div data-testid="splash" />,
}))

vi.mock('@lib/ui/loaders/Spinner', () => ({
  Spinner: () => <div data-testid="spinner" />,
}))

const SplashProbe = () => {
  const { hasCompletedStartupSplash } = useStartupSplash()

  return <div data-testid={`completed-${hasCompletedStartupSplash}`} />
}

describe('StartupPlaceholder', () => {
  it('shows a spinner and reports the splash as done in instant mode', () => {
    render(
      <StartupSplashProvider mode="instant">
        <StartupPlaceholder />
        <SplashProbe />
      </StartupSplashProvider>
    )

    expect(screen.getByTestId('spinner')).toBeTruthy()
    expect(screen.queryByTestId('splash')).toBeNull()
    expect(screen.getByTestId('completed-true')).toBeTruthy()
  })

  it('keeps the product logo block in splash mode', () => {
    render(
      <StartupSplashProvider>
        <StartupPlaceholder />
        <SplashProbe />
      </StartupSplashProvider>
    )

    expect(screen.getByTestId('splash')).toBeTruthy()
    expect(screen.queryByTestId('spinner')).toBeNull()
    expect(screen.getByTestId('completed-false')).toBeTruthy()
  })
})
