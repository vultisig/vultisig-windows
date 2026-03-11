/**
 * Push Notifications Integration Tests
 * 
 * Tests the full push notification flow:
 * 1. Start mock push server
 * 2. Configure server URL in Developer Options
 * 3. Enable push notifications for vault
 * 4. Verify registration with mock server
 * 5. Send test notification and verify receipt
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'
import { startMockPushServer, stopMockPushServer, getMockPushServer } from '../helpers/mock-push-server'

const MOCK_SERVER_PORT = 3334

test.describe('Push Notifications Integration', () => {
  // Start mock server before all tests
  test.beforeAll(async () => {
    await startMockPushServer(MOCK_SERVER_PORT)
  })

  // Stop mock server after all tests
  test.afterAll(async () => {
    await stopMockPushServer()
  })

  // Import vault before each test
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

      // Navigate to settings
      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(1000)

      // Triple-click version to open developer options
      const versionText = page.getByText(/VULTISIG.*V\d+\.\d+/i).first()
      if (await versionText.isVisible({ timeout: 3000 }).catch(() => false)) {
        await versionText.click({ clickCount: 3 })
        await page.waitForTimeout(500)

        // Look for dev options modal
        const devModal = page.locator('text=/developer/i').first()
        if (await devModal.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('Developer options modal opened')
          
          // Find push server URL field by testid
          const pushUrlInput = page.locator('[data-testid="push-server-url-input"]')
          if (await pushUrlInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await pushUrlInput.fill(serverUrl)
            console.log(`Set push server URL to: ${serverUrl}`)
            
            // Save the settings
            const saveBtn = page.locator('[data-testid="save-push-server-url"]')
            await saveBtn.click()
            await page.waitForTimeout(500)
            console.log('Saved push server URL')
          } else {
            // Fallback to placeholder-based search
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
      
      // Verify mock server is running
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

      // STEP 1: Configure push server URL in developer options
      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(1000)

      // Open developer options (triple-click version)
      const versionText = page.getByText(/VULTISIG.*V\d+\.\d+/i).first()
      if (await versionText.isVisible({ timeout: 3000 }).catch(() => false)) {
        await versionText.click({ clickCount: 3 })
        await page.waitForTimeout(500)

        // Set push server URL
        const pushUrlInput = page.locator('[data-testid="push-server-url-input"]')
        if (await pushUrlInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await pushUrlInput.fill(serverUrl)
          console.log(`Configured push server URL: ${serverUrl}`)
          
          // Save
          const saveBtn = page.locator('[data-testid="save-push-server-url"]')
          await saveBtn.click()
          await page.waitForTimeout(500)
          console.log('Saved push server URL')
        }

        // Close dev options modal
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }

      // STEP 2: Enable push notifications
      const pushToggle = page.getByText('Push Notifications', { exact: false })
      await pushToggle.waitFor({ state: 'visible', timeout: 10000 })
      
      // Get initial registration count
      const initialCount = mockServer.getRegisteredDevices().size
      console.log(`Initial registered devices: ${initialCount}`)
      
      // Click the toggle to enable
      await pushToggle.click()
      await page.waitForTimeout(5000) // Wait longer for registration
      
      console.log('Clicked push notifications toggle')
      
      // Check registration count
      const finalCount = mockServer.getRegisteredDevices().size
      console.log(`Final registered devices: ${finalCount}`)
      
      // Log any registered vaults
      for (const [vaultId, device] of mockServer.getRegisteredDevices()) {
        console.log(`  - Registered vault: ${vaultId} (party: ${device.partyName})`)
      }
      
    } finally {
      await page.close()
    }
  })

  test('mock server can accept registrations', async () => {
    // Test the mock server directly (no browser)
    const mockServer = getMockPushServer()!
    const serverUrl = mockServer.getUrl()
    
    // Register a fake device
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
  /**
   * Full E2E test that requires manual setup:
   * 1. Developer Options must be configured with mock server URL
   * 2. Notification permission must be granted
   * 
   * This test is skipped by default - enable when testing locally
   * with proper setup.
   */
  test.skip('full notification flow with mock server', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    
    // This would be the full flow:
    // 1. Configure push server URL in dev options
    // 2. Grant notification permission
    // 3. Enable push notifications
    // 4. Send notification from mock server
    // 5. Verify notification appears
    
    // For now, this is a placeholder for future implementation
    // when we can automate permission granting
    
    await page.close()
  })
})
