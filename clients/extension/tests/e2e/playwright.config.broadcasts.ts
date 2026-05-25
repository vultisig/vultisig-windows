// Variant of playwright.config.ts that drops fund-dependent.dependencies so
// real-send/real-swap specs can run without being gated by the v1.0.60
// push-notification regression in the network project.
import baseConfig from './playwright.config'
import { defineConfig } from '@playwright/test'

const projects = (baseConfig.projects || []).map((p) => {
  if (p.name === 'fund-dependent') {
    const existingMatch =
      p.testMatch == null
        ? []
        : Array.isArray(p.testMatch)
          ? p.testMatch
          : [p.testMatch]
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
