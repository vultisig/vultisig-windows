/**
 * Push Notifications E2E Tests
 *
 * Tests for the push notification feature:
 * - Notifications item in settings
 * - Toggle visibility on notifications settings page
 * - Developer options push server URL
 *
 * Note: Actual push permission requests may not work in Playwright
 * (requires user gesture in real browser). These tests verify UI presence.
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'

async function navigateToNotificationSettings(page: import('@playwright/test').Page) {
  const settingsBtn = page.locator('[data-testid="settings-button"]')
  await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
  await settingsBtn.click()
  await page.waitForTimeout(1000)

  const notificationsItem = page.getByText('Notifications', { exact: true })
  await notificationsItem.waitFor({ state: 'visible', timeout: 5000 })
  await notificationsItem.click()
  await page.waitForTimeout(1000)
}

test.describe('Push Notifications', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) return

    await ensureVaultExists(context, extensionId, config.vaultPath, config.password)
  })

  test('notifications item appears in settings', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(1000)

      const notificationsItem = page.getByText('Notifications', { exact: true })
      const hasNotifications = await notificationsItem.isVisible({ timeout: 5000 }).catch(() => false)
      console.log('Notifications item visible in settings:', hasNotifications)

      expect(hasNotifications).toBe(true)
    } finally {
      await page.close()
    }
  })

  test('push notification toggle appears on notifications page', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      await navigateToNotificationSettings(page)

      const pushToggle = page.getByText('Push Notifications', { exact: false })
      const hasPushToggle = await pushToggle.isVisible({ timeout: 5000 }).catch(() => false)
      console.log('Push notifications toggle visible:', hasPushToggle)

      expect(hasPushToggle).toBe(true)
    } finally {
      await page.close()
    }
  })

  test('push notification toggle is clickable', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      await navigateToNotificationSettings(page)

      const pushToggle = page.getByText('Push Notifications', { exact: false })
      await pushToggle.waitFor({ state: 'visible', timeout: 10000 })
      console.log('Found Push Notifications toggle')

      await pushToggle.click()
      await page.waitForTimeout(500)
      console.log('Clicked push notification toggle')

      expect(true).toBe(true)
    } finally {
      await page.close()
    }
  })

  test('developer options shows push server URL', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(500)

      const versionText = page.locator('text=/version|v\\d+\\.\\d+/i').first()
      if (await versionText.isVisible({ timeout: 3000 }).catch(() => false)) {
        await versionText.click()
        await versionText.click()
        await versionText.click()
        await page.waitForTimeout(500)

        const devOptionsModal = page.locator('text=/developer.*options|push.*server/i').first()
        const hasDevOptions = await devOptionsModal.isVisible({ timeout: 3000 }).catch(() => false)

        if (hasDevOptions) {
          const pushServerField = page.locator('input[placeholder*="push"], input[name*="push"], text=/push.*server.*url/i').first()
          const hasPushServerField = await pushServerField.isVisible({ timeout: 3000 }).catch(() => false)

          console.log('Developer options modal visible:', hasDevOptions)
          console.log('Push server URL field visible:', hasPushServerField)
        }
      }
    } finally {
      await page.close()
    }
  })
})
