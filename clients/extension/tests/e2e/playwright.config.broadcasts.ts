/**
 * One-off Playwright config for v1.0.60 broadcast verification.
 * Identical to playwright.config.ts but with fund-dependent.dependencies removed.
 * Allows running the real-send / real-swap specs without being gated by the
 * v1.0.60 push-notification regression in the network project.
 */
import baseConfig from './playwright.config'
import { defineConfig } from '@playwright/test'

const projects = (baseConfig.projects || []).map((p) => {
  if (p.name === 'fund-dependent') {
    const existingMatch = Array.isArray(p.testMatch) ? p.testMatch : [p.testMatch as string]
    return {
      ...p,
      dependencies: [],
      testMatch: [...existingMatch, '**/dump-vault-addresses.spec.ts'],
    }
  }
  return p
})

export default defineConfig({
  ...baseConfig,
  projects,
})
