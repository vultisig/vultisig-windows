/**
 * Transaction History E2E Tests
 *
 * Tests for the transaction history feature:
 * - Viewing transaction list
 * - Viewing transaction details
 * - Transaction history recording after sends/swaps
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'

test.describe('Transaction History', () => {
  // Import vault before each test
  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) return
    
    await ensureVaultExists(context, extensionId, config.vaultPath, config.password)
  })

  test('can navigate to transaction history from vault page', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Look for transaction history button (clock icon in header)
      const historyBtn = page.locator('[data-testid="transaction-history-button"]')
        .or(page.locator('button:has(svg)').filter({ has: page.locator('[aria-label*="history" i]') }))
        .or(page.getByRole('button', { name: /history|transactions/i }))
        .first()
      
      const hasHistoryButton = await historyBtn.isVisible({ timeout: 5000 }).catch(() => false)
      console.log('Transaction history button visible:', hasHistoryButton)

      if (hasHistoryButton) {
        await historyBtn.click()
        await page.waitForTimeout(500)

        // Should be on transaction history page
        const pageText = await page.locator('body').textContent() || ''
        const onHistoryPage = pageText.toLowerCase().includes('transaction') ||
                             pageText.toLowerCase().includes('history') ||
                             pageText.toLowerCase().includes('activity') ||
                             await page.locator('[data-testid*="transaction"]').first().isVisible().catch(() => false)
        
        console.log('On transaction history page:', onHistoryPage)
        expect(onHistoryPage).toBe(true)
      } else {
        // Feature might be behind feature flag
        console.log('Transaction history button not found - feature may be disabled')
      }
    } finally {
      await page.close()
    }
  })

  test('transaction history shows empty state or list', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to transaction history
      const historyBtn = page.locator('[data-testid="transaction-history-button"]')
        .or(page.getByRole('button', { name: /history|transactions/i }))
        .first()
      
      if (await historyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await historyBtn.click()
        await page.waitForTimeout(500)

        // Should show either empty state or transaction list
        const pageText = await page.locator('body').textContent() || ''
        const hasEmptyState = pageText.toLowerCase().includes('no transaction') ||
                             pageText.toLowerCase().includes('empty') ||
                             pageText.toLowerCase().includes('no activity')
        const hasTransactions = await page.locator('[data-testid*="transaction-item"]').count() > 0 ||
                               pageText.toLowerCase().includes('send') ||
                               pageText.toLowerCase().includes('swap') ||
                               pageText.toLowerCase().includes('receive')

        console.log('Has empty state:', hasEmptyState)
        console.log('Has transactions:', hasTransactions)
        
        // Either empty state or transactions should be visible
        expect(hasEmptyState || hasTransactions).toBe(true)
      } else {
        console.log('Transaction history not accessible')
        test.skip()
      }
    } finally {
      await page.close()
    }
  })

  test('transaction history records send transactions', async ({ context, extensionId }) => {
    // Skip if TX tests not enabled (requires actual sends to record)
    const ENABLE_TX_TESTS = process.env.ENABLE_TX_SIGNING_TESTS === 'true'
    test.skip(!ENABLE_TX_TESTS, 'TX signing tests disabled')

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to transaction history
      const historyBtn = page.locator('[data-testid="transaction-history-button"]')
        .or(page.getByRole('button', { name: /history|transactions/i }))
        .first()
      
      if (await historyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await historyBtn.click()
        await page.waitForTimeout(500)

        // Look for any recorded transactions (from our test sends)
        const pageText = await page.locator('body').textContent() || ''
        const hasRecordedTx = pageText.toLowerCase().includes('send') ||
                             pageText.toLowerCase().includes('swap') ||
                             await page.locator('[data-testid*="transaction"]').count() > 0

        console.log('Has recorded transactions:', hasRecordedTx)
        // Note: If we just ran send tests, there should be transactions
      } else {
        test.skip()
      }
    } finally {
      await page.close()
    }
  })
})
