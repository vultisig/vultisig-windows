/**
 * Guards the swap form's fiat input mode (#4938). The From card keeps the
 * token amount as the editable field with the fiat value under it; tapping
 * the fiat line flips the two so a fiat amount can be typed, and tapping the
 * token line under it brings token input back with the converted amount.
 */

import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { expect, test } from '../fixtures/extension-loader'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { SwapFlow } from '../page-objects/SwapFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const popup = { width: 360, height: 600 }

test.describe('swap From fiat input', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()
    if (!config) {
      test.skip()
      return
    }

    await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )
  })

  test('flips between token and fiat input from the secondary line', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    await page.setViewportSize(popup)
    const vaultPage = new VaultPage(page, extensionId)
    const swapFlow = new SwapFlow(page, extensionId)

    await vaultPage.goto()
    await vaultPage.waitForView(20_000)
    await vaultPage.navigateToSwap()
    await swapFlow.waitForView(20_000)

    const fiatLine = page.getByTestId('swap-from-fiat-amount')
    const fiatInput = page.getByTestId('swap-from-fiat-amount-input')
    const tokenLine = page.getByTestId('swap-from-token-amount')

    // Token input is the default, and the fiat line only appears once the
    // From coin has a price behind it.
    await expect(swapFlow.fromAmountInput).toBeVisible()
    await expect(fiatLine).toBeVisible({ timeout: 30_000 })
    await expect(fiatInput).toHaveCount(0)

    const artifactDirectory = process.env.EXTENSION_SWAP_FIAT_QA_ARTIFACT_DIR
    if (artifactDirectory) {
      await mkdir(artifactDirectory, { recursive: true })
    }

    await swapFlow.fromAmountInput.fill('1')
    await expect(fiatLine).not.toHaveText(/^\$0\.00$/)
    if (artifactDirectory) {
      await page.screenshot({
        path: join(artifactDirectory, 'swap-from-token-mode.png'),
      })
    }

    await fiatLine.click()
    await expect(fiatInput).toBeVisible()
    await expect(fiatInput).toBeFocused()
    await expect(swapFlow.fromAmountInput).toHaveCount(0)
    // Entering fiat mode carries the typed token amount over as its fiat value.
    await expect(fiatInput).not.toHaveValue('')
    await expect(tokenLine).toContainText('1')

    await fiatInput.fill('10')
    const convertedTokenAmount = await tokenLine.textContent()
    expect(convertedTokenAmount).not.toMatch(/^0 /)
    if (artifactDirectory) {
      await page.screenshot({
        path: join(artifactDirectory, 'swap-from-fiat-mode.png'),
      })
    }

    // Percent chips still resolve against the token balance; in fiat mode the
    // field shows that amount's fiat value.
    await page.getByRole('button', { name: '25%' }).click()
    await expect(fiatInput).not.toHaveValue('10')

    await tokenLine.click()
    await expect(swapFlow.fromAmountInput).toBeVisible()
    await expect(fiatInput).toHaveCount(0)
    await expect(swapFlow.fromAmountInput).not.toHaveValue('')

    await page.close()
  })
})
