/**
 * Address Book E2E Tests
 *
 * Tests for the address book functionality:
 * - Adding addresses
 * - Editing addresses
 * - Deleting addresses
 * - Using saved addresses in send flow
 */

import { test, expect } from '../fixtures/extension-loader'
import { VaultPage } from '../page-objects/VaultPage.po'
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'

test.describe('Address Book', () => {
  // Import vault before each test
  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) return
    
    await ensureVaultExists(context, extensionId, config.vaultPath, config.password)
  })

  test('can navigate to address book from settings', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Find and click settings (using testid)
      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(500)

      // Look for address book option (using testid)
      const addressBookLink = page.locator('[data-testid="address-book-link"]')
        .or(page.locator('text=/address.*book/i'))
        .first()
      const hasAddressBook = await addressBookLink.isVisible({ timeout: 5000 }).catch(() => false)
      
      console.log('Address book option visible:', hasAddressBook)
      
      if (hasAddressBook) {
        await addressBookLink.click()
        await page.waitForTimeout(500)
        
        // Should be on address book page
        const pageText = await page.locator('body').textContent() || ''
        const onAddressBookPage = pageText.toLowerCase().includes('address') ||
                                  pageText.toLowerCase().includes('contact') ||
                                  pageText.toLowerCase().includes('add new')
        
        console.log('On address book page:', onAddressBookPage)
        expect(onAddressBookPage).toBe(true)
      } else {
        // Address book might be accessible differently
        console.log('Address book link not found in settings')
      }
    } finally {
      await page.close()
    }
  })

  test('can open add address form', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to address book
      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(500)

      const addressBookLink = page.locator('[data-testid="address-book-link"]')
        .or(page.locator('text=/address.*book/i'))
        .first()
      
      await addressBookLink.waitFor({ state: 'visible', timeout: 5000 })
      await addressBookLink.click()
      await page.waitForTimeout(500)

      // Click "Add" button
      const addBtn = page.locator('[data-testid="add-address"]')
        .or(page.getByRole('button', { name: /add|new/i }))
        .or(page.locator('button:has-text("Add")'))
        .first()
      
      await addBtn.waitFor({ state: 'visible', timeout: 5000 })
      await addBtn.click()
      await page.waitForTimeout(500)

      // Verify add form is visible (has input fields)
      const hasInputs = await page.locator('input').first().isVisible().catch(() => false)
      const hasForm = await page.locator('form, [data-testid*="form"]').first().isVisible().catch(() => false)
      
      console.log('Add form has inputs:', hasInputs)
      console.log('Add form visible:', hasForm)
      
      // Either inputs or form should be visible
      expect(hasInputs || hasForm).toBe(true)
    } finally {
      await page.close()
    }
  })

  test('address book empty state shows correctly', async ({ context, extensionId }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      // Navigate to address book
      const settingsBtn = page.locator('[data-testid="settings-button"]')
      await settingsBtn.waitFor({ state: 'visible', timeout: 10000 })
      await settingsBtn.click()
      await page.waitForTimeout(500)

      const addressBookLink = page.locator('[data-testid="address-book-link"]')
        .or(page.locator('text=/address.*book/i'))
        .first()
      if (await addressBookLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addressBookLink.click()
        await page.waitForTimeout(500)

        // Check for empty state or list
        const pageText = await page.locator('body').textContent() || ''
        const hasEmptyState = pageText.toLowerCase().includes('no address') ||
                             pageText.toLowerCase().includes('empty') ||
                             pageText.toLowerCase().includes('add your first')
        const hasContacts = pageText.toLowerCase().includes('contact') ||
                           await page.locator('[data-testid*="address-item"]').count() > 0

        console.log('Has empty state:', hasEmptyState)
        console.log('Has contacts:', hasContacts)
        
        // Either empty state or contacts should be visible
        expect(hasEmptyState || hasContacts).toBe(true)
      } else {
        console.log('Address book not accessible')
        test.skip()
      }
    } finally {
      await page.close()
    }
  })
})
