import type { BrowserContext } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { SwapFlow } from '../page-objects/SwapFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

/** No ticker on any chain starts with this, so the search always comes up empty. */
const unmatchableQuery = 'ZZQQXX'

const pepeContract = '0x6982508145454Ce325dDbE47a25d4ec3d2311933'
const pepeTicker = 'PEPE'

const openAssetPicker = async ({
  context,
  extensionId,
}: {
  context: BrowserContext
  extensionId: string
}) => {
  const page = await context.newPage()
  const vaultPage = new VaultPage(page, extensionId)
  const swapFlow = new SwapFlow(page, extensionId)

  await vaultPage.goto()
  await vaultPage.waitForView(20_000)
  await vaultPage.navigateToSwap()
  await swapFlow.waitForView(20_000)
  await swapFlow.fromCoinSelector.click()

  await expect(page.getByText('Select asset', { exact: true })).toBeVisible()

  return { page, swapFlow }
}

test.describe('swap asset search empty state', () => {
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

  test('offers the custom-token flow only where a token can be resolved', async ({
    context,
    extensionId,
  }) => {
    const { page, swapFlow } = await openAssetPicker({ context, extensionId })

    // The picker autofocuses its search field, so its placeholder is already
    // cleared — identify it as the one text input that isn't the amount field
    // sitting behind the modal.
    const search = page.locator(
      'input[type="text"]:not([data-testid="swap-from-amount-input"]):visible'
    )
    const emptyState = page.getByTestId('swap-explorer-empty-state')
    const addCustomToken = page.getByTestId('swap-explorer-add-custom-token')

    // The picker opens on the vault's from-chain, which holds a single coin and
    // so renders no search field at all. Ethereum is the chain with enough
    // tokens to search through.
    await page.getByTestId('swap-explorer-chain-Ethereum').click()
    await expect(search).toBeVisible()
    await expect(emptyState).toHaveCount(0)

    await search.fill(unmatchableQuery)
    await expect(emptyState).toBeVisible()
    await expect(emptyState).toContainText('No token found')
    await expect(addCustomToken).toBeVisible()

    // Bitcoin has no token metadata source, so the flow would dead-end the user
    // a second time — the card stays, the CTA does not.
    await page.getByTestId('swap-explorer-chain-Bitcoin').click()
    await expect(emptyState).toBeVisible()
    await expect(addCustomToken).toHaveCount(0)

    // Bitcoin leaves the picker with a single option, which is under the search
    // field's own threshold. The field still has to be there, or the query that
    // is hiding every row can never be cleared.
    await expect(search).toBeVisible()
    await expect(search).toHaveValue(unmatchableQuery)

    await page.getByTestId('swap-explorer-chain-Ethereum').click()
    await expect(addCustomToken).toBeVisible()
    await addCustomToken.click()

    // The flow opens over the picker rather than navigating away, so the swap
    // form survives and the user lands back on the picker they searched in.
    await expect(page.getByText('Find custom token')).toBeVisible()
    await expect(swapFlow.swapForm).toBeVisible()

    await page.getByTestId('modal-close-button').click()
    await expect(page.getByText('Select asset', { exact: true })).toBeVisible()
    await expect(search).toHaveValue(unmatchableQuery)

    await page.close()
  })

  test('a token added from the empty state can be picked into the form', async ({
    context,
    extensionId,
  }) => {
    const { page, swapFlow } = await openAssetPicker({ context, extensionId })

    const search = page.locator(
      'input[type="text"]:not([data-testid="swap-from-amount-input"]):visible'
    )

    await page.getByTestId('swap-explorer-chain-Ethereum').click()
    await expect(search).toBeVisible()
    await search.fill(unmatchableQuery)
    await page.getByTestId('swap-explorer-add-custom-token').click()

    await expect(page.getByText('Find custom token')).toBeVisible()

    // The custom-token field is a different input from the picker's search
    // field, and unlike it carries no `type` attribute to select on.
    await page.getByLabel('Search').fill(pepeContract)

    const addButton = page.getByRole('button', { name: `Add ${pepeTicker} Token` })
    await expect(addButton).toBeVisible({ timeout: 30_000 })
    await addButton.click()

    // The picker comes back with the query pointed at what was just added, so
    // the token the user could not find is the one row now on screen.
    await expect(page.getByText('Select asset', { exact: true })).toBeVisible()
    await expect(search).toHaveValue(pepeTicker)

    const addedOption = page.getByTestId(`coin-option-${pepeTicker}`)
    await expect(addedOption).toHaveCount(1)

    await addedOption.click()
    await expect(page.getByText('Select asset', { exact: true })).toHaveCount(0)
    await expect(swapFlow.fromCoinSelector).toContainText(pepeTicker)

    await page.close()
  })
})
