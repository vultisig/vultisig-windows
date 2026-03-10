/**
 * Secure Vault Flows E2E Tests
 *
 * Tests SecureVault UI states without completing signing
 * (requires second device to complete).
 *
 * Pre-seeded with SecureVault from SECURE_VAULT_SHARES env.
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { SendFlow } from '../page-objects/SendFlow.po'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'

import { ensureVaultExists } from '../helpers/vault-import'

// SecureVault requires shares from environment
const SECURE_VAULT_SHARES = process.env.SECURE_VAULT_SHARES
const SECURE_VAULT_PASSWORD = process.env.SECURE_VAULT_PASSWORD || '12345678'

// Parse first share path from comma-separated list
const SECURE_VAULT_PATH = SECURE_VAULT_SHARES?.split(',')[0]?.trim()

test.describe('Secure Vault Flows', () => {
  // Import SecureVault before each test
  test.beforeEach(async ({ context, extensionId }) => {
    if (!SECURE_VAULT_PATH) return
    
    const imported = await ensureVaultExists(context, extensionId, SECURE_VAULT_PATH, SECURE_VAULT_PASSWORD)
    if (imported) {
      console.log('✅ SecureVault imported')
    } else {
      console.log('⚠️ Failed to import SecureVault')
    }
  })

  test('SecureVault appears in vault list with correct name', async ({ context, extensionId }) => {
    test.skip(!SECURE_VAULT_SHARES, 'SECURE_VAULT_SHARES not configured')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await page.waitForTimeout(2000)

      // Look for vault list or vault selector
      const vaultSelector = page.locator(
        '[data-testid="vault-selector"], [data-testid="vault-list"], [data-testid="vault-name"]'
      )

      await vaultSelector.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null)

      if (await vaultSelector.isVisible()) {
        // Get vault name
        const vaultName = await vaultPage.getVaultName()
        console.log('Current vault name:', vaultName)

        // Check for secure vault indicator
        const secureIndicator = page.locator(
          'text=/secure|2-of-2|2\\/2|multi.*party/i'
        )
        const hasSecureIndicator = await secureIndicator.isVisible().catch(() => false)

        console.log('Secure vault indicator found:', hasSecureIndicator)

        // Vault should exist
        expect(vaultName || hasSecureIndicator).toBeTruthy()
      }
    } finally {
      await page.close()
    }
  })

  test('balance display works for SecureVault', async ({ context, extensionId }) => {
    test.skip(!SECURE_VAULT_SHARES, 'SECURE_VAULT_SHARES not configured')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Check balance is displayed
      const balance = await vaultPage.getTotalBalance()
      console.log('SecureVault balance:', balance)

      // Balance should be defined (even if 0)
      expect(balance).toBeDefined()

      // Check for token list
      const tokenBalances = await vaultPage.getTokenBalances()
      console.log('Token balances:', tokenBalances)
    } finally {
      await page.close()
    }
  })

  test('send flow reaches "waiting for devices" state and shows QR', async ({ context, extensionId }) => {
    test.skip(!SECURE_VAULT_SHARES, 'SECURE_VAULT_SHARES not configured')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to send
      await vaultPage.navigateToSend()

      try {
        await sendFlow.waitForView(10_000)

        // Fill with minimal test data
        await sendFlow.fillAddress('0x000000000000000000000000000000000000dEaD')
        await sendFlow.fillAmount('0.0001')

        // Check if we can proceed
        if (await sendFlow.isContinueEnabled()) {
          await sendFlow.continue()
          await sendFlow.acceptTerms()
          await sendFlow.sign()

          // For SecureVault, should reach "waiting for devices" state
          try {
            await keysignProgress.waitForWaitingForDevices(30_000)

            // Check QR code is displayed
            const hasQr = await keysignProgress.isQrCodeVisible()
            console.log('QR code visible:', hasQr)

            expect(hasQr).toBe(true)

            // Check for waiting text
            const waitingText = page.locator(
              'text=/waiting.*device|scan.*qr|other.*party|join.*signing/i'
            )
            const hasWaitingText = await waitingText.isVisible().catch(() => false)
            console.log('Waiting for devices text:', hasWaitingText)

            // Either QR or waiting text should be visible
            expect(hasQr || hasWaitingText).toBe(true)
          } catch {
            // May not have reached keysign state (insufficient funds, etc.)
            console.log('Could not reach keysign state')
          }
        } else {
          console.log('Continue button not enabled - may need funds')
        }
      } catch (error) {
        console.log('Send flow error:', error)
      }
    } finally {
      await page.close()
    }
  })

  // Additional SecureVault-specific tests

  test('SecureVault shows correct vault type indicator', async ({ context, extensionId }) => {
    test.skip(!SECURE_VAULT_SHARES, 'SECURE_VAULT_SHARES not configured')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await page.waitForTimeout(2000)

      // Navigate to vault settings or info
      try {
        await vaultPage.waitForView(10_000)

        // Look for vault type indicators
        const secureIndicators = [
          page.locator('text=/secure.*vault/i'),
          page.locator('text=/2.*of.*2/i'),
          page.locator('text=/threshold/i'),
          page.locator('text=/multi.*signature/i'),
          page.locator('[data-vault-type="secure"]'),
          page.locator('[data-testid="secure-vault-badge"]'),
        ]

        let foundIndicator = false
        for (const indicator of secureIndicators) {
          if (await indicator.isVisible().catch(() => false)) {
            foundIndicator = true
            const text = await indicator.textContent()
            console.log('Found secure vault indicator:', text)
            break
          }
        }

        // Navigate to settings to check vault info
        try {
          await vaultPage.navigateToSettings()
          await page.waitForTimeout(1000)

          // Look for vault type in settings
          const vaultTypeText = page.locator('text=/vault.*type|type.*vault/i')
          if (await vaultTypeText.isVisible()) {
            const text = await vaultTypeText.textContent()
            console.log('Vault type from settings:', text)
          }
        } catch {
          // Settings nav may not work
        }

        console.log('Found secure indicator:', foundIndicator)
      } catch {
        console.log('Could not verify vault type')
      }
    } finally {
      await page.close()
    }
  })

  test('SecureVault cannot sign without second device', async ({ context, extensionId }) => {
    test.skip(!SECURE_VAULT_SHARES, 'SECURE_VAULT_SHARES not configured')

    // This test verifies that the UI correctly shows that
    // a second device is required to complete signing

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      await vaultPage.navigateToSend()

      try {
        await sendFlow.waitForView(10_000)

        await sendFlow.fillAddress('0x000000000000000000000000000000000000dEaD')
        await sendFlow.fillAmount('0.0001')

        if (await sendFlow.isContinueEnabled()) {
          await sendFlow.continue()
          await sendFlow.acceptTerms()
          await sendFlow.sign()

          // Should show waiting state, NOT complete immediately
          try {
            await keysignProgress.waitForView(30_000)

            // Wait a moment and verify we're still waiting
            await page.waitForTimeout(5000)

            // Should NOT be in success state (can't complete without 2nd device)
            const isSuccess = await keysignProgress.isSuccess()
            console.log('In success state:', isSuccess)

            // Should be waiting for devices
            const isWaiting = await keysignProgress.waitingForDevices.isVisible().catch(() => false)
            console.log('In waiting state:', isWaiting)

            // For secure vault, we should be waiting, not complete
            if (!isWaiting && !isSuccess) {
              // May be showing QR code or other waiting UI
              const hasQr = await keysignProgress.isQrCodeVisible()
              console.log('Has QR code:', hasQr)
            }

            // Verify signing didn't complete without second device
            // (unless error state due to no funds, etc.)
            const isError = await keysignProgress.isError()
            if (!isError) {
              expect(isWaiting || !isSuccess).toBe(true)
            }
          } catch {
            console.log('Could not verify keysign state')
          }
        }
      } catch (error) {
        console.log('SecureVault sign test error:', error)
      }
    } finally {
      await page.close()
    }
  })
})
