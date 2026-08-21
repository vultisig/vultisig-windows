// @vitest-environment happy-dom
/**
 * Rendering contract of the storage migrations gate. The whole extension app
 * mounts behind StorageMigrationsManager, so its MatchQuery must land on a
 * branch that renders something for every mutation outcome. A void migration
 * result once left it on the null `inactive` branch forever, shipping a
 * blank popup with no error anywhere.
 */
import { migrateExtensionStorage } from '@core/extension/storage/migrations/migrateExtensionStorage'
import { StorageMigrationsManager } from '@core/extension/storage/migrations/StorageMigrationManager'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/extension/storage/migrations/migrateExtensionStorage', () => ({
  migrateExtensionStorage: vi.fn(),
}))

vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({ version: '0.2.2' }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@core/ui/product/ProductLogoBlock', () => ({
  ProductLogoBlock: () => <div data-testid="splash" />,
}))

vi.mock('@core/ui/flow/FlowErrorPageContent', () => ({
  FlowErrorPageContent: ({ title }: { title: string }) => (
    <div data-testid="migration-error">{title}</div>
  ),
}))

const renderManager = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <StorageMigrationsManager>
        <div data-testid="app-content" />
      </StorageMigrationsManager>
    </QueryClientProvider>
  )

describe('StorageMigrationsManager', () => {
  beforeEach(() => {
    vi.mocked(migrateExtensionStorage).mockReset()
  })

  it('renders children once migrations complete', async () => {
    vi.mocked(migrateExtensionStorage).mockResolvedValueOnce(undefined)

    renderManager()

    expect(await screen.findByTestId('app-content')).toBeTruthy()
    expect(vi.mocked(migrateExtensionStorage)).toHaveBeenCalledWith('0.2.2')
  })

  it('shows the migration error page when migrating fails', async () => {
    vi.mocked(migrateExtensionStorage).mockRejectedValueOnce(
      new Error('migration failed')
    )

    renderManager()

    expect(await screen.findByTestId('migration-error')).toBeTruthy()
  })
})
