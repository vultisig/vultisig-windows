/**
 * Integration Tests - Extension React Layer
 *
 * NOTE: The VultiConnect extension on main has a thin React layer.
 * Most UI components live in @core/ui and @core/inpage-provider/popup/view,
 * not in clients/extension/src directly. The extension-specific React
 * components (NavigationProvider, setup pages, keygen pages, etc.) are
 * tightly coupled to:
 *   - Chrome extension APIs (chrome.sidePanel, chrome.tabs)
 *   - Deep @core/ui dependencies with styled-components
 *   - Complex navigation state management
 *
 * Testing these in isolation would require mocking 20+ modules deep,
 * which would test the mocks rather than the code. Instead, we verify
 * that the modules can be imported and have the expected exports.
 *
 * Full component rendering tests are better suited for E2E tests
 * with the actual built extension.
 */

import { describe, expect, it, vi } from 'vitest'

// We can at least verify the module structure exists
describe('Extension module structure', () => {
  it('errorHandler exports EIP1193Error class', async () => {
    const mod = await import('@clients/extension/src/background/handlers/errorHandler')
    expect(mod.EIP1193Error).toBeDefined()
    expect(typeof mod.EIP1193Error).toBe('function')
  })

  it('injectHelpers exports shouldInjectProvider', async () => {
    const mod = await import('@clients/extension/src/inpage/utils/injectHelpers')
    expect(mod.shouldInjectProvider).toBeDefined()
    expect(typeof mod.shouldInjectProvider).toBe('function')
  })

  it('ethereum events type exports exist', async () => {
    // This verifies the type module can be imported without errors
    const mod = await import('@clients/extension/src/inpage/providers/ethereum/events')
    expect(mod).toBeDefined()
  })
})
