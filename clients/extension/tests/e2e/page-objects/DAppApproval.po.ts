/**
 * DApp Approval Page Object Model
 *
 * Handles the approval popup for DApp requests:
 * - approve() - click approve button in popup
 * - reject() - click reject button
 * - getRequestedPermissions() - get what DApp is requesting
 * - getMessage() - get message content for signing requests
 */

import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.po'

export class DAppApproval extends BasePage {
  constructor(page: Page, extensionId: string) {
    super(page, extensionId)
  }

  /**
   * Locators
   */

  get approvalContainer(): Locator {
    return this.page.locator('[data-testid="dapp-approval"]')
  }

  get dappInfo(): Locator {
    return (
      this.page.locator('[data-testid="dapp-info"]') ||
      this.page.locator('[data-testid="dapp-origin"]')
    )
  }

  get dappUrl(): Locator {
    return (
      this.page.locator('[data-testid="dapp-url"]') ||
      this.page.locator('text=/http|localhost|127\\.0\\.0\\.1/').first()
    )
  }

  get requestType(): Locator {
    return (
      this.page.locator('[data-testid="request-type"]') ||
      this.page.locator('text=/connect|sign|transaction|switch/i').first()
    )
  }

  get permissionsList(): Locator {
    return this.page.locator('[data-testid="permissions-list"]')
  }

  get messageContent(): Locator {
    return (
      this.page.locator('[data-testid="message-content"]') ||
      this.page.locator('[data-testid="sign-message"]') ||
      this.page.locator('text=/message|sign/i').first()
    )
  }

  get txDetails(): Locator {
    return (
      this.page.locator('[data-testid="tx-details"]') ||
      this.page.locator('[data-testid="transaction-details"]')
    )
  }

  get approveButton(): Locator {
    return (
      this.page.locator('[data-testid="approve-button"]') ||
      this.page.getByRole('button', { name: /approve|confirm|connect|sign|allow/i })
    )
  }

  get rejectButton(): Locator {
    return (
      this.page.locator('[data-testid="reject-button"]') ||
      this.page.getByRole('button', { name: /reject|cancel|deny|close/i })
    )
  }

  get warningMessage(): Locator {
    return (
      this.page.locator('[data-testid="warning-message"]') ||
      this.page.locator('[role="alert"]') ||
      this.page.locator('.warning')
    )
  }

  get accountSelector(): Locator {
    return this.page.locator('[data-testid="account-selector"]')
  }

  get chainSelector(): Locator {
    return this.page.locator('[data-testid="chain-selector"]')
  }

  /**
   * Wait for approval popup to be visible
   */
  async waitForView(timeout = 15_000): Promise<void> {
    await Promise.race([
      this.approvalContainer.waitFor({ state: 'visible', timeout }),
      this.approveButton.waitFor({ state: 'visible', timeout }),
      this.page.waitForSelector('text=/connect|approve|sign|allow/i', { timeout }),
    ])
  }

  /**
   * Click approve button
   */
  async approve(): Promise<void> {
    await expect(this.approveButton).toBeVisible()
    await this.approveButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Click reject button
   */
  async reject(): Promise<void> {
    await expect(this.rejectButton).toBeVisible()
    await this.rejectButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Get the DApp URL/origin making the request
   */
  async getDappOrigin(): Promise<string | null> {
    if (await this.dappUrl.isVisible()) {
      return (await this.dappUrl.textContent()) || null
    }

    if (await this.dappInfo.isVisible()) {
      return (await this.dappInfo.textContent()) || null
    }

    return null
  }

  /**
   * Get the type of request (connect, sign, transaction, etc.)
   */
  async getRequestType(): Promise<string | null> {
    if (await this.requestType.isVisible()) {
      const text = await this.requestType.textContent()
      if (text) {
        if (text.toLowerCase().includes('connect')) return 'connect'
        if (text.toLowerCase().includes('sign')) return 'sign'
        if (text.toLowerCase().includes('transaction')) return 'transaction'
        if (text.toLowerCase().includes('switch')) return 'switch-chain'
      }
    }

    // Try to infer from buttons or content
    const pageText = (await this.page.textContent('body')) || ''
    if (pageText.toLowerCase().includes('connect')) return 'connect'
    if (pageText.toLowerCase().includes('sign message')) return 'sign'
    if (pageText.toLowerCase().includes('transaction')) return 'transaction'
    if (pageText.toLowerCase().includes('switch chain')) return 'switch-chain'

    return null
  }

  /**
   * Get requested permissions
   */
  async getRequestedPermissions(): Promise<string[]> {
    const permissions: string[] = []

    if (await this.permissionsList.isVisible()) {
      const items = await this.permissionsList.locator('li, div, span').all()
      for (const item of items) {
        const text = await item.textContent()
        if (text && text.trim()) {
          permissions.push(text.trim())
        }
      }
    }

    // If no explicit list, extract from page content
    if (permissions.length === 0) {
      const pageText = (await this.page.textContent('body')) || ''

      if (pageText.includes('address') || pageText.includes('account')) {
        permissions.push('view address')
      }
      if (pageText.includes('balance')) {
        permissions.push('view balance')
      }
      if (pageText.includes('sign')) {
        permissions.push('sign messages')
      }
      if (pageText.includes('transaction')) {
        permissions.push('send transactions')
      }
    }

    return permissions
  }

  /**
   * Get message content for signing requests
   */
  async getMessage(): Promise<string | null> {
    if (await this.messageContent.isVisible()) {
      return (await this.messageContent.textContent()) || null
    }

    // Try to find message in any pre/code block
    const codeBlock = this.page.locator('pre, code, [data-testid*="message"]').first()
    if (await codeBlock.isVisible()) {
      return (await codeBlock.textContent()) || null
    }

    return null
  }

  /**
   * Get transaction details for send requests
   */
  async getTransactionDetails(): Promise<{
    to?: string
    value?: string
    data?: string
  }> {
    const details: { to?: string; value?: string; data?: string } = {}

    if (await this.txDetails.isVisible()) {
      const text = await this.txDetails.textContent()
      if (text) {
        // Extract to address
        const toMatch = text.match(/to[:\s]*(0x[a-fA-F0-9]{40})/i)
        if (toMatch) details.to = toMatch[1]

        // Extract value
        const valueMatch = text.match(/value[:\s]*([0-9.]+)/i)
        if (valueMatch) details.value = valueMatch[1]

        // Extract data
        const dataMatch = text.match(/data[:\s]*(0x[a-fA-F0-9]+)/i)
        if (dataMatch) details.data = dataMatch[1]
      }
    }

    return details
  }

  /**
   * Check if there's a warning displayed
   */
  async hasWarning(): Promise<boolean> {
    return this.warningMessage.isVisible()
  }

  /**
   * Get warning message text
   */
  async getWarning(): Promise<string | null> {
    if (await this.warningMessage.isVisible()) {
      return (await this.warningMessage.textContent()) || null
    }
    return null
  }

  /**
   * Check if approve button is enabled
   */
  async isApproveEnabled(): Promise<boolean> {
    return this.approveButton.isEnabled()
  }

  /**
   * Select a specific account (if multiple available)
   */
  async selectAccount(index: number): Promise<void> {
    if (await this.accountSelector.isVisible()) {
      await this.accountSelector.click()
      const options = this.page.locator('[data-testid^="account-option-"]')
      const option = options.nth(index)
      if (await option.isVisible()) {
        await option.click()
      }
    }
  }

  /**
   * Wait for popup to close (after approve/reject)
   */
  async waitForClose(timeout = 10_000): Promise<void> {
    try {
      await this.approveButton.waitFor({ state: 'hidden', timeout })
    } catch {
      // Popup might have closed immediately
    }
  }
}
