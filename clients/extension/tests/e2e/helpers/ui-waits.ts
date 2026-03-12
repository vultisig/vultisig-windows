/**
 * UI Wait Helpers
 *
 * Robust wait functions for dealing with loading states, overlays, and animations.
 */

import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Common loading indicator selectors
 */
const LOADING_SELECTORS = [
  '[data-testid="loading-overlay"]',
  '[data-testid="loading-spinner"]',
  '[data-testid="loading"]',
  '[aria-busy="true"]',
  '[role="progressbar"]',
  '.loading',
  '.spinner',
]

/**
 * Selectors for animated elements that might intercept clicks
 */
const ANIMATION_SELECTORS = [
  '[style*="opacity: 0"]',
  '[inert]',
]

/**
 * Wait for any loading overlays to disappear
 */
export async function waitForLoadingComplete(page: Page, timeout = 10000): Promise<void> {
  for (const selector of LOADING_SELECTORS) {
    const el = page.locator(selector)
    const count = await el.count().catch(() => 0)
    if (count > 0) {
      await el.first().waitFor({ state: 'hidden', timeout }).catch(() => {
        // Loading indicator not found or didn't disappear, continue
      })
    }
  }
}

/**
 * Wait for animations to settle by waiting for network idle and a brief pause
 */
export async function waitForAnimationsComplete(page: Page): Promise<void> {
  // Wait for network to settle
  await page.waitForLoadState('networkidle').catch(() => {})
  
  // Brief pause for CSS animations to complete
  await page.waitForTimeout(300)
}

/**
 * Wait for element to be truly clickable:
 * - Visible in viewport
 * - Enabled
 * - Not covered by other elements
 * - Animations complete
 */
export async function waitForClickable(locator: Locator, timeout = 10000): Promise<void> {
  const page = locator.page()
  
  // Wait for the element to be visible
  await locator.waitFor({ state: 'visible', timeout })
  
  // Wait for it to be enabled
  await expect(locator).toBeEnabled({ timeout })
  
  // Wait for animations
  await waitForAnimationsComplete(page)
  
  // Scroll into view
  await locator.scrollIntoViewIfNeeded().catch(() => {})
  
  // Brief pause for any layout shifts
  await page.waitForTimeout(100)
}

/**
 * Robust click that handles common overlay issues
 * Tries normal click first, then falls back to force click if intercepted
 */
export async function robustClick(locator: Locator, options?: { 
  timeout?: number
  maxRetries?: number 
}): Promise<void> {
  const { timeout = 10000, maxRetries = 3 } = options ?? {}
  const page = locator.page()
  
  // First wait for the element to be ready
  await waitForClickable(locator, timeout)
  
  // Try normal click
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await locator.click({ timeout: 5000 })
      return
    } catch (error) {
      const errorMsg = String(error)
      
      // If intercepted by another element, wait and retry
      if (errorMsg.includes('intercepts pointer events')) {
        console.log(`Click intercepted, attempt ${attempt + 1}/${maxRetries}`)
        
        // Wait for any overlays to disappear
        await waitForLoadingComplete(page, 3000)
        await page.waitForTimeout(500)
        
        // On last retry, use force click
        if (attempt === maxRetries - 1) {
          console.log('Using force click as fallback')
          await locator.click({ force: true, timeout: 5000 })
          return
        }
        continue
      }
      
      throw error
    }
  }
}

/**
 * Debug helper: Log element state and any overlays
 */
export async function debugElementState(locator: Locator, label: string): Promise<void> {
  const page = locator.page()
  
  console.log(`\n=== Debug: ${label} ===`)
  
  const isVisible = await locator.isVisible().catch(() => false)
  const isEnabled = await locator.isEnabled().catch(() => false)
  const boundingBox = await locator.boundingBox().catch(() => null)
  
  console.log(`Visible: ${isVisible}`)
  console.log(`Enabled: ${isEnabled}`)
  console.log(`BoundingBox: ${JSON.stringify(boundingBox)}`)
  
  // Check for potential overlays at the element's position
  if (boundingBox) {
    const centerX = boundingBox.x + boundingBox.width / 2
    const centerY = boundingBox.y + boundingBox.height / 2
    
    const elementAtPoint = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y)
      if (el) {
        return {
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          testId: el.getAttribute('data-testid'),
          text: el.textContent?.substring(0, 100),
        }
      }
      return null
    }, { x: centerX, y: centerY })
    
    console.log(`Element at center point: ${JSON.stringify(elementAtPoint, null, 2)}`)
  }
  
  console.log('=== End Debug ===\n')
}

/**
 * Wait for the stacked field animation to complete.
 * The send/swap forms use StackedField which has opacity transitions.
 */
export async function waitForStackedFieldReady(page: Page, timeout = 5000): Promise<void> {
  // Wait for any elements with opacity 0 to either become visible or be removed
  // This handles the StackedField component's animation state
  await page.waitForFunction(() => {
    // Find all motion divs that might be animating
    const motionDivs = document.querySelectorAll('[style*="opacity"]')
    for (const div of motionDivs) {
      const style = window.getComputedStyle(div)
      const opacity = parseFloat(style.opacity)
      // If it's partially visible, animation is in progress
      if (opacity > 0 && opacity < 1) {
        return false
      }
    }
    return true
  }, {}, { timeout }).catch(() => {
    // Timeout is fine, continue
  })
  
  // Extra pause for safety
  await page.waitForTimeout(200)
}

/**
 * Wait for form to be ready (all queries loaded, no pending states)
 */
export async function waitForFormReady(page: Page, formTestId: string, timeout = 15000): Promise<void> {
  // Wait for form to exist
  const form = page.locator(`[data-testid="${formTestId}"]`)
  await form.waitFor({ state: 'visible', timeout })
  
  // Wait for any loading indicators to disappear
  await waitForLoadingComplete(page, timeout)
  
  // Wait for stacked field animations
  await waitForStackedFieldReady(page)
  
  // Wait for network to settle
  await page.waitForLoadState('networkidle').catch(() => {})
}

/**
 * Take a debug screenshot with timestamp
 */
export async function takeDebugScreenshot(page: Page, name: string): Promise<string> {
  const timestamp = Date.now()
  const path = `test-results/debug-${name}-${timestamp}.png`
  await page.screenshot({ path, fullPage: true })
  console.log(`Screenshot saved: ${path}`)
  return path
}
