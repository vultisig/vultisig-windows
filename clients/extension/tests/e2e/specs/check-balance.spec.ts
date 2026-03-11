import { test } from '../fixtures/extension-loader'
import { importVaultViaUI, getVaultConfigFromEnv } from '../helpers/vault-import'

test('check vault balances', async ({ context, extensionId }) => {
  const config = getVaultConfigFromEnv()
  if (!config) { test.skip(); return }
  
  const page = await context.newPage()
  await importVaultViaUI(page, { ...config, extensionId })
  
  await page.waitForTimeout(5000)
  
  const text = await page.locator('body').textContent()
  console.log('Vault page:', text?.substring(0, 1000))
})
