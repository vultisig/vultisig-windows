/**
 * Dump Vault Addresses
 *
 * One-shot spec that imports the test vault and writes every chain address
 * present in chrome.storage to a JSON file. Used for QA chain top-up planning —
 * the file lists every address that needs funding to expand send/swap coverage.
 *
 * Output: tests/e2e/test-results/vault-addresses.json
 *
 * Run with:
 *   npx playwright test --config tests/e2e/playwright.config.broadcasts.ts \
 *     --project=fund-dependent --grep "dump-vault-addresses"
 *
 * Or against the standard config when network deps are healthy:
 *   npx playwright test --grep "dump-vault-addresses"
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { test, expect } from '../fixtures/extension-loader'
import { ensureVaultExists, getVaultConfigFromEnv } from '../helpers/vault-import'
import { getVaultAddresses } from '../helpers/vault-addresses'
import { enableChains, CHAIN_UI_LABELS } from '../helpers/enable-chains'
import { VaultPage } from '../page-objects/VaultPage.po'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_EXPANSION_CHAINS = [
  'arbitrum', 'optimism', 'base', 'polygon', 'avalanche',
  'litecoin', 'dogecoin', 'bitcoincash', 'zcash', 'dash',
  'sui', 'ton', 'tron', 'ripple', 'polkadot', 'cardano',
]

test.describe('Vault Address Dump', () => {
  test('exports all chain addresses from chrome.storage', async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) {
      throw new Error('TEST_VAULT_PATH / TEST_VAULT_PASSWORD env vars required')
    }

    const imported = await ensureVaultExists(context, extensionId, config.vaultPath, config.password)
    expect(imported).toBeTruthy()

    const expansionChains = (process.env.ENABLE_CHAINS || '').split(',').map(s => s.trim()).filter(Boolean)
    const toEnable = expansionChains.length ? expansionChains : DEFAULT_EXPANSION_CHAINS

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    await vaultPage.goto()
    await vaultPage.waitForView(15_000)

    console.log(`\n🔧 Enabling ${toEnable.length} chains: ${toEnable.join(', ')}\n`)
    const result = await enableChains(page, toEnable)
    console.log(`  enabled: ${result.enabled.join(', ') || '(none)'}`)
    console.log(`  already on: ${result.skipped.join(', ') || '(none)'}`)
    console.log(`  missing from UI: ${result.missing.join(', ') || '(none)'}`)

    // Give chrome.storage a beat to settle
    await page.waitForTimeout(2_000)
    await page.close()

    const addresses = await getVaultAddresses(context)
    expect(Object.keys(addresses).length).toBeGreaterThan(0)

    const outDir = path.resolve(__dirname, '..', 'test-results')
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true })
    }
    const outPath = path.join(outDir, 'vault-addresses.json')

    const payload = {
      capturedAt: new Date().toISOString(),
      vaultPath: config.vaultPath,
      chainCount: Object.keys(addresses).length,
      addresses,
    }
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2))

    console.log(`\n📋 Vault addresses (${Object.keys(addresses).length} chains):\n`)
    for (const [chain, addr] of Object.entries(addresses).sort()) {
      console.log(`  ${chain.padEnd(14)} ${addr}`)
    }
    console.log(`\n✅ Written to ${outPath}\n`)
  })
})
