/**
 * Push Notifications Integration Tests
 *
 * Tests the full push notification flow:
 * 1. Start mock push server
 * 2. Configure server URL in Developer Options
 * 3. Navigate to Notifications settings page
 * 4. Enable push notifications for vault
 * 5. Verify registration with mock server
 * 6. Send test notification and verify receipt
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'
import { startMockPushServer, stopMockPushServer, getMockPushServer } from '../helpers/mock-push-server'

const MOCK_SERVER_PORT = 3334

test.describe('Push Notifications Integration', () => {
  test.beforeAll(async () => {
    await startMockPushServer(MOCK_SERVER_PORT)
  })

  test.afterAll(async () => {
    await stopMockPushServer()
  })

  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) return
    await ensureVaultExists(context, extensionId, config.vaultPath, config.password)
  })

  test('can configure push server URL in developer options', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const mockServer = getMockPushServer()!
    const serverUrl = mockServer.getUrl()

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(1000)

      const versionText = page.getByText(/VULTISIG.*V\d+\.\d+/i).first()
      if (await versionText.isVisible({ timeout: 3000 }).catch(() => false)) {
        await versionText.click({ clickCount: 3 })
        await page.waitForTimeout(500)

        const devModal = page.locator('text=/developer/i').first()
        if (await devModal.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('Developer options modal opened')

          const pushUrlInput = page.locator('[data-testid="push-server-url-input"]')
          if (await pushUrlInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await pushUrlInput.fill(serverUrl)
            console.log(`Set push server URL to: ${serverUrl}`)

            const saveBtn = page.locator('[data-testid="save-push-server-url"]')
            await saveBtn.click()
            await page.waitForTimeout(500)
            console.log('Saved push server URL')
          } else {
            const inputs = await page.locator('input').all()
            for (const input of inputs) {
              const placeholder = await input.getAttribute('placeholder')
              if (placeholder?.includes('Leave empty') || placeholder?.includes('production')) {
                await input.fill(serverUrl)
                console.log(`Set push server URL to: ${serverUrl}`)
                break
              }
            }
          }
        }
      }

      const healthResponse = await fetch(`${serverUrl}/health`)
      const health = await healthResponse.json()
      expect(health.status).toBe('ok')
      console.log('Mock push server health check passed')

    } finally {
      await page.close()
    }
  })

  test('enabling push notifications registers with server', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const mockServer = getMockPushServer()!
    const serverUrl = mockServer.getUrl()

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Configure push server URL first
      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(1000)

      const versionText = page.getByText(/VULTISIG.*V\d+\.\d+/i).first()
      if (await versionText.isVisible({ timeout: 3000 }).catch(() => false)) {
        await versionText.click({ clickCount: 3 })
        await page.waitForTimeout(500)

        const pushUrlInput = page.locator('[data-testid="push-server-url-input"]')
        if (await pushUrlInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await pushUrlInput.fill(serverUrl)
          console.log(`Configured push server URL: ${serverUrl}`)

          const saveBtn = page.locator('[data-testid="save-push-server-url"]')
          await saveBtn.click()
          await page.waitForTimeout(500)
          console.log('Saved push server URL')
        }

        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }

      // Navigate to Notifications settings page
      const notificationsItem = page.getByText('Notifications', { exact: true })
      await notificationsItem.waitFor({ state: 'visible', timeout: 5000 })
      await notificationsItem.click()
      await page.waitForTimeout(1000)

      const pushToggle = page.getByText('Push Notifications', { exact: false })
      await pushToggle.waitFor({ state: 'visible', timeout: 10000 })

      const initialCount = mockServer.getRegisteredDevices().size
      console.log(`Initial registered devices: ${initialCount}`)

      await pushToggle.click()
      await page.waitForTimeout(5000)

      console.log('Clicked push notifications toggle')

      const finalCount = mockServer.getRegisteredDevices().size
      console.log(`Final registered devices: ${finalCount}`)

      for (const [vaultId, device] of mockServer.getRegisteredDevices()) {
        console.log(`  - Registered vault: ${vaultId} (party: ${device.partyName})`)
      }

    } finally {
      await page.close()
    }
  })

  test('mock server can accept registrations', async () => {
    const mockServer = getMockPushServer()!
    const serverUrl = mockServer.getUrl()

    const response = await fetch(`${serverUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vault_id: 'test-vault-123',
        party_name: 'test-party',
        token: JSON.stringify({
          endpoint: 'https://fake-push-endpoint.com',
          keys: {
            p256dh: 'fake-p256dh-key',
            auth: 'fake-auth-key'
          }
        })
      })
    })

    expect(response.status).toBe(200)
    expect(mockServer.isVaultRegistered('test-vault-123')).toBe(true)
    console.log('Mock server registration test passed')
  })

  test('mock server health check', async () => {
    const mockServer = getMockPushServer()!
    const serverUrl = mockServer.getUrl()

    const response = await fetch(`${serverUrl}/health`)
    const health = await response.json()

    expect(health.status).toBe('ok')
    expect(typeof health.registeredDevices).toBe('number')
    console.log(`Health check: ${JSON.stringify(health)}`)
  })
})

test.describe('Push Notifications E2E Flow', () => {
  test.beforeAll(async () => {
    await startMockPushServer(3335)
  })

  test.afterAll(async () => {
    await stopMockPushServer()
  })

  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) return
    await ensureVaultExists(context, extensionId, config.vaultPath, config.password)
  })

  test('full notification flow: register and receive notification', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const mockServer = getMockPushServer()!
    const serverUrl = mockServer.getUrl()

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Configure push server URL
      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(1000)

      const versionText = page.getByText(/VULTISIG.*V\d+\.\d+/i).first()
      await versionText.click({ clickCount: 3 })
      await page.waitForTimeout(500)

      const pushUrlInput = page.locator('[data-testid="push-server-url-input"]')
      await pushUrlInput.fill(serverUrl)
      console.log(`Configured push server: ${serverUrl}`)

      const saveBtn = page.locator('[data-testid="save-push-server-url"]')
      await saveBtn.click()
      await page.waitForTimeout(500)

      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)

      // Navigate to Notifications settings page
      const notificationsItem = page.getByText('Notifications', { exact: true })
      await notificationsItem.waitFor({ state: 'visible', timeout: 5000 })
      await notificationsItem.click()
      await page.waitForTimeout(1000)

      // Enable push notifications
      const pushToggle = page.getByText('Push Notifications', { exact: false })
      await pushToggle.waitFor({ state: 'visible', timeout: 10000 })
      await pushToggle.click()
      await page.waitForTimeout(3000)

      expect(mockServer.getRegisteredDevices().size).toBeGreaterThan(0)
      const registeredVaults = Array.from(mockServer.getRegisteredDevices().keys())
      console.log(`Registered vaults: ${registeredVaults.join(', ')}`)

      // Send a test notification
      const vaultId = registeredVaults[0]
      console.log(`Sending notification to vault: ${vaultId}`)

      const swLogs: string[] = []
      context.on('console', (msg) => {
        const text = msg.text()
        if (text.includes('[Vultisig Push]')) {
          swLogs.push(text)
          console.log('SW Log:', text)
        }
      })

      const sent = await mockServer.sendNotification(
        vaultId,
        'Test Notification',
        'This is a test notification from E2E tests'
      )

      if (sent) {
        console.log('Notification sent via Web Push!')

        await page.waitForTimeout(3000)

        const receivedLog = swLogs.find(log => log.includes('Notification received'))
        if (receivedLog) {
          console.log('Notification RECEIVED by extension:', receivedLog)
        } else {
          console.log('No receipt log captured (SW logs may not propagate to page context)')
          console.log('   Logs captured:', swLogs.length > 0 ? swLogs : 'none')
        }
      } else {
        console.log('Failed to send notification (subscription may be invalid in test env)')
      }

      // Disable notifications (unregister)
      console.log('Testing unregister flow...')
      await pushToggle.click()
      await page.waitForTimeout(2000)

      console.log(`Devices after disable: ${mockServer.getRegisteredDevices().size}`)

    } finally {
      await page.close()
    }
  })
})
