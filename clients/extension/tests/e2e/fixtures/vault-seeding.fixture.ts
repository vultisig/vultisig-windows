/**
 * Vault Seeding Fixture
 *
 * Pre-seeds chrome.storage.local with test vaults:
 * - Reads vault from TEST_VAULT_PATH env var
 * - Writes vault data in extension format
 * - Sets hasFinishedOnboarding: true to skip onboarding
 *
 * Provides 3 vault variants:
 * 1. fastVault — Pre-created FastVault (from .vult file)
 * 2. seedphraseVault — FastVault created from seedphrase
 * 3. secureVault — Pre-created SecureVault (from SECURE_VAULT_SHARES)
 */

import { test as base, type BrowserContext, type Page } from '@playwright/test'
import { test as extensionTest, type ExtensionFixtures } from './extension.fixture'
import {
  StorageKey,
  writeChromeStorageMultiple,
} from '../helpers/chrome-storage'
import {
  VaultData,
  generateVaultId,
  loadTestVault,
  loadSecureVaultShares,
  createMockFastVault,
  createMockSecureVault,
} from '../helpers/vault-factory'

/**
 * Vault seeding fixture types
 */
export interface VaultSeedingFixtures extends ExtensionFixtures {
  /** Pre-seeded fast vault data */
  fastVault: VaultData | null
  /** Pre-seeded secure vault data */
  secureVault: VaultData | null
  /** Helper to seed a vault into storage */
  seedVault: (vault: VaultData) => Promise<void>
  /** Helper to seed vault and navigate to vault page */
  seedVaultAndNavigate: (vault: VaultData) => Promise<Page>
}

/**
 * Extended test with vault seeding fixtures
 */
export const test = extensionTest.extend<VaultSeedingFixtures>({
  // Fast vault from TEST_VAULT_PATH or mock
  fastVault: async ({}, use) => {
    const vault = loadTestVault()
    if (vault) {
      console.log('✅ Loaded fast vault:', vault.name)
    } else {
      console.log('ℹ️  No fast vault configured, using mock')
    }
    await use(vault)
  },

  // Secure vault from SECURE_VAULT_SHARES or mock
  secureVault: async ({}, use) => {
    const shares = loadSecureVaultShares()
    if (shares.length > 0) {
      console.log('✅ Loaded secure vault:', shares[0].name)
      await use(shares[0])
    } else {
      console.log('ℹ️  No secure vault configured, using mock')
      await use(null)
    }
  },

  // Helper to seed a vault into storage
  seedVault: async ({ context }, use) => {
    const seedVault = async (vault: VaultData) => {
      const vaultId = generateVaultId(vault)

      // Prepare storage data
      const storageData = {
        [StorageKey.vaults]: [vault],
        [StorageKey.currentVaultId]: vaultId,
        [StorageKey.hasFinishedOnboarding]: true,
        // Also store in SDK format for VaultBridge compatibility
        [`vult:${vault.publicKeys.ecdsa}`]: vault,
      }

      await writeChromeStorageMultiple(context, storageData)
      console.log(`✅ Seeded vault: ${vault.name} (ID: ${vaultId})`)
    }

    await use(seedVault)
  },

  // Helper to seed vault and navigate to vault page
  seedVaultAndNavigate: async ({ context, extensionId, seedVault }, use) => {
    const seedVaultAndNavigate = async (vault: VaultData) => {
      await seedVault(vault)

      // Navigate to extension popup
      const page = await context.newPage()
      const extensionUrl = `chrome-extension://${extensionId}/index.html`
      await page.goto(extensionUrl)
      await page.waitForLoadState('domcontentloaded')

      // Wait for vault page to load (should skip onboarding)
      await page.waitForTimeout(500) // Brief wait for React to render

      return page
    }

    await use(seedVaultAndNavigate)
  },
})

export const expect = test.expect

/**
 * Convenience fixtures for common test scenarios
 */

/**
 * Test with a pre-seeded fast vault
 */
export const testWithFastVault = test.extend<{
  seededPage: Page
}>({
  seededPage: async ({ fastVault, seedVaultAndNavigate }, use) => {
    const vault = fastVault || createMockFastVault()
    const page = await seedVaultAndNavigate(vault)
    await use(page)
  },
})

/**
 * Test with a pre-seeded secure vault
 */
export const testWithSecureVault = test.extend<{
  seededPage: Page
}>({
  seededPage: async ({ secureVault, seedVaultAndNavigate }, use) => {
    const vault = secureVault || createMockSecureVault()
    const page = await seedVaultAndNavigate(vault)
    await use(page)
  },
})
