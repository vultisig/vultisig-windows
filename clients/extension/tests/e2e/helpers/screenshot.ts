/**
 * Screenshot Helpers for Visual Regression Testing
 *
 * Provides utilities for capturing consistent screenshots and masking dynamic content.
 */

import { type Page } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

// Base directory for screenshots
const SCREENSHOTS_DIR = 'test-results/screenshots'
const BASELINES_DIR = 'test-results/baselines'

/**
 * Ensure screenshot directories exist
 */
function ensureDirectories(): void {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  }
  if (!fs.existsSync(BASELINES_DIR)) {
    fs.mkdirSync(BASELINES_DIR, { recursive: true })
  }
}

/**
 * Take a screenshot with standard naming convention
 *
 * @param page - Playwright page object
 * @param name - Descriptive name for the screenshot (will be slugified)
 * @returns Path to the saved screenshot
 */
export async function takeScreenshot(page: Page, name: string): Promise<string> {
  ensureDirectories()

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready)

  // Wait a bit for any animations to settle
  await page.waitForTimeout(300)

  // Slugify the name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${slug}-${timestamp}.png`
  const filepath = path.join(SCREENSHOTS_DIR, filename)

  await page.screenshot({
    path: filepath,
    fullPage: false,
    animations: 'disabled',
  })

  return filepath
}

/**
 * Take a baseline screenshot (for visual regression comparison)
 *
 * @param page - Playwright page object
 * @param name - Name for the baseline (without extension)
 * @returns Path to the saved baseline
 */
export async function takeBaseline(page: Page, name: string): Promise<string> {
  ensureDirectories()

  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const filepath = path.join(BASELINES_DIR, `${slug}.png`)

  await page.screenshot({
    path: filepath,
    fullPage: false,
    animations: 'disabled',
  })

  return filepath
}

/**
 * Mask dynamic content on the page before taking screenshots
 *
 * This adds CSS overlays to hide elements that change between runs
 * (like balances, timestamps, addresses, etc.)
 *
 * @param page - Playwright page object
 * @param selectors - Array of CSS selectors to mask
 */
export async function maskDynamicContent(
  page: Page,
  selectors: string[]
): Promise<void> {
  await page.addStyleTag({
    content: `
      ${selectors.join(', ')} {
        visibility: hidden !important;
        background: repeating-linear-gradient(
          45deg,
          #e0e0e0,
          #e0e0e0 10px,
          #f0f0f0 10px,
          #f0f0f0 20px
        ) !important;
      }
    `,
  })
}

/**
 * Common dynamic content selectors for Vultisig
 */
export const DYNAMIC_SELECTORS = {
  balances: [
    '[data-testid="balance-value"]',
    '[data-testid="vault-total-balance"]',
    '[data-testid="chain-balance"]',
  ],
  timestamps: [
    '[data-testid="timestamp"]',
    '[data-testid="last-updated"]',
    'time',
  ],
  addresses: [
    '[data-testid="wallet-address"]',
    '[data-testid="ecdsa-key"]',
    '[data-testid="eddsa-key"]',
  ],
  transactionDetails: [
    '[data-testid="tx-hash"]',
    '[data-testid="tx-amount"]',
    '[data-testid="gas-fee"]',
  ],
}

/**
 * Mask all common dynamic content
 */
export async function maskAllDynamic(page: Page): Promise<void> {
  const allSelectors = [
    ...DYNAMIC_SELECTORS.balances,
    ...DYNAMIC_SELECTORS.timestamps,
    ...DYNAMIC_SELECTORS.addresses,
    ...DYNAMIC_SELECTORS.transactionDetails,
  ]
  await maskDynamicContent(page, allSelectors)
}

/**
 * Mask only balance-related content
 */
export async function maskBalances(page: Page): Promise<void> {
  await maskDynamicContent(page, DYNAMIC_SELECTORS.balances)
}

/**
 * Take a masked screenshot (with common dynamic content hidden)
 */
export async function takeMaskedScreenshot(
  page: Page,
  name: string,
  selectorsToMask?: string[]
): Promise<string> {
  const selectors = selectorsToMask || [
    ...DYNAMIC_SELECTORS.balances,
    ...DYNAMIC_SELECTORS.timestamps,
  ]

  await maskDynamicContent(page, selectors)
  return takeScreenshot(page, name)
}

/**
 * Compare screenshot with baseline
 * Returns true if images match (within threshold)
 *
 * Note: This is a simple existence check. For actual pixel comparison,
 * use Playwright's built-in toHaveScreenshot() or a dedicated library.
 */
export async function compareWithBaseline(
  page: Page,
  baselineName: string
): Promise<boolean> {
  const baselinePath = path.join(BASELINES_DIR, `${baselineName}.png`)

  if (!fs.existsSync(baselinePath)) {
    console.log(`Baseline not found: ${baselinePath}. Creating new baseline.`)
    await takeBaseline(page, baselineName)
    return true
  }

  // For actual comparison, use Playwright's expect(page).toHaveScreenshot()
  // This is just a stub for the helper
  return true
}

/**
 * Screenshot configuration for common scenarios
 */
export const SCREENSHOT_CONFIGS = {
  onboarding: {
    name: 'onboarding',
    mask: [],
  },
  vaultTypeSelection: {
    name: 'vault-type-selection',
    mask: [],
  },
  fastVaultForm: {
    name: 'fast-vault-form',
    mask: [],
  },
  vaultPage: {
    name: 'vault-page',
    mask: DYNAMIC_SELECTORS.balances,
  },
  chainDetail: {
    name: 'chain-detail',
    mask: [...DYNAMIC_SELECTORS.balances, ...DYNAMIC_SELECTORS.addresses],
  },
  sendForm: {
    name: 'send-form',
    mask: DYNAMIC_SELECTORS.balances,
  },
  swapForm: {
    name: 'swap-form',
    mask: [...DYNAMIC_SELECTORS.balances, ...DYNAMIC_SELECTORS.transactionDetails],
  },
}
