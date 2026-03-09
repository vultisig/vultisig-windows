/**
 * Vault Seeding Fixture
 *
 * Imports test vaults via the extension UI:
 * - Reads vault config from TEST_VAULT_PATH/TEST_VAULT_PASSWORD env vars
 * - Imports via UI flow (mimics real user behavior)
 * - Handles encrypted .vult files properly
 *
 * Provides fixtures for:
 * 1. fastVaultImported — Imports FastVault via UI
 * 2. secureVaultImported — Imports SecureVault via UI
 * 3. ensureVaultExists — Helper to check/import vault on demand
 */

import { test as base, type BrowserContext, type Page } from '@playwright/test'
import { test as extensionTest, type ExtensionFixtures } from './extension.fixture'
import {
  importVaultViaUI,
  ensureVaultExists,
  isOnVaultPage,
  getVaultConfigFromEnv,
  getSecureVaultConfigFromEnv,
} from '../helpers/vault-import'

/**
 * Vault seeding fixture types
 */
export interface VaultSeedingFixtures extends ExtensionFixtures {
  /** Import fast vault and return page positioned on vault */
  fastVaultPage: Page | null
  /** Import secure vault and return page positioned on vault */
  secureVaultPage: Page | null
  /** Helper to ensure vault exists (imports if needed) */
  ensureVault: () => Promise<boolean>
  /** Helper to import vault via UI */
  importVaultUI: (vaultPath: string, password: string) => Promise<Page | null>
  /** Check if we have a vault loaded */
  hasVault: (page: Page) => Promise<boolean>
}

/**
 * Extended test with vault seeding fixtures
 */
export const test = extensionTest.extend<VaultSeedingFixtures>({
  // Import fast vault and get page
  fastVaultPage: async ({ context, extensionId }, use) => {
    const config = getVaultConfigFromEnv()

    if (!config) {
      console.log('ℹ️  No fast vault configured (TEST_VAULT_PATH not set)')
      await use(null)
      return
    }

    const page = await context.newPage()
    const imported = await importVaultViaUI(page, {
      ...config,
      extensionId,
    })

    if (imported) {
      console.log('✅ Fast vault imported via UI')
      await use(page)
    } else {
      console.log('⚠️  Failed to import fast vault')
      await page.close()
      await use(null)
    }
  },

  // Import secure vault and get page
  secureVaultPage: async ({ context, extensionId }, use) => {
    const configs = getSecureVaultConfigFromEnv()

    if (configs.length === 0) {
      console.log('ℹ️  No secure vault configured (SECURE_VAULT_SHARES not set)')
      await use(null)
      return
    }

    // Import first share
    const config = configs[0]
    const page = await context.newPage()
    const imported = await importVaultViaUI(page, {
      ...config,
      extensionId,
    })

    if (imported) {
      console.log('✅ Secure vault imported via UI')
      await use(page)
    } else {
      console.log('⚠️  Failed to import secure vault')
      await page.close()
      await use(null)
    }
  },

  // Helper to ensure vault exists (imports if needed)
  ensureVault: async ({ context, extensionId }, use) => {
    const ensureVault = async (): Promise<boolean> => {
      const config = getVaultConfigFromEnv()

      if (!config) {
        console.log('⚠️  No vault config available')
        return false
      }

      return ensureVaultExists(context, extensionId, config.vaultPath, config.password)
    }

    await use(ensureVault)
  },

  // Helper to import vault via UI
  importVaultUI: async ({ context, extensionId }, use) => {
    const importVaultUI = async (vaultPath: string, password: string): Promise<Page | null> => {
      const page = await context.newPage()
      const imported = await importVaultViaUI(page, {
        vaultPath,
        password,
        extensionId,
      })

      if (imported) {
        return page
      }

      await page.close()
      return null
    }

    await use(importVaultUI)
  },

  // Helper to check if vault is loaded
  hasVault: async ({}, use) => {
    await use(isOnVaultPage)
  },
})

export const expect = test.expect

/**
 * Convenience fixtures for common test scenarios
 */

/**
 * Test with a pre-imported fast vault
 * Skips test if vault import fails
 */
export const testWithFastVault = test.extend<{
  vaultPage: Page
}>({
  vaultPage: async ({ fastVaultPage }, use, testInfo) => {
    if (!fastVaultPage) {
      testInfo.skip(true, 'Fast vault not configured or import failed')
      return
    }
    await use(fastVaultPage)
  },
})

/**
 * Test with a pre-imported secure vault
 * Skips test if vault import fails
 */
export const testWithSecureVault = test.extend<{
  vaultPage: Page
}>({
  vaultPage: async ({ secureVaultPage }, use, testInfo) => {
    if (!secureVaultPage) {
      testInfo.skip(true, 'Secure vault not configured or import failed')
      return
    }
    await use(secureVaultPage)
  },
})

/**
 * Test that imports vault on demand
 * Provides ensureVault helper for tests that need conditional vault
 */
export const testWithVaultSupport = test.extend<{
  getVaultPage: () => Promise<Page | null>
}>({
  getVaultPage: async ({ context, extensionId }, use) => {
    const getVaultPage = async (): Promise<Page | null> => {
      const config = getVaultConfigFromEnv()
      if (!config) {
        return null
      }

      const page = await context.newPage()
      const imported = await importVaultViaUI(page, {
        ...config,
        extensionId,
      })

      if (imported) {
        return page
      }

      await page.close()
      return null
    }

    await use(getVaultPage)
  },
})
