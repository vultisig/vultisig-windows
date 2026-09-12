/**
 * Guards the chain page's Tokens tab empty state (#4908). Searching for a
 * ticker that no enabled token matches used to leave the area under the tabs
 * header blank; it now renders the "No tokens found" card with a shortcut
 * to the manage-tokens screen, and narrowing the search back brings the list
 * back.
 */

import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { expect, test } from '../fixtures/extension-loader'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { VaultPage } from '../page-objects/VaultPage.po'

/** No ticker on any chain starts with this, so the search always comes up empty. */
const unmatchableQuery = 'ZZQQXX'
const popup = { width: 360, height: 600 }

test.describe('chain page tokens empty state', () => {
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

  test('shows the card only while the search matches nothing', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    await page.setViewportSize(popup)
    const vaultPage = new VaultPage(page, extensionId)

    await vaultPage.goto()
    await vaultPage.waitForView(20_000)
    await vaultPage.navigateToChain('Ethereum')

    const emptyState = page.getByTestId('vault-chain-tokens-empty-state')
    const searchToggle = page.getByTestId('vault-chain-token-search-toggle')
    const search = page.locator('input[type="text"]:visible')

    // The native coin is always enabled, so the list starts with its row and
    // the card has no reason to be there.
    const nativeRow = page.getByText('ETH', { exact: true }).first()
    await expect(nativeRow).toBeVisible({ timeout: 30_000 })
    await expect(emptyState).toHaveCount(0)

    await searchToggle.click()
    await expect(search).toBeVisible()
    await search.fill(unmatchableQuery)

    await expect(emptyState).toBeVisible()
    await expect(emptyState).toContainText('No tokens found')
    await expect(emptyState).not.toContainText("You've disabled all tokens.")
    await expect(nativeRow).toHaveCount(0)

    const artifactDirectory = process.env.EXTENSION_CHAIN_TOKENS_QA_ARTIFACT_DIR
    if (artifactDirectory) {
      await mkdir(artifactDirectory, { recursive: true })
      await page.screenshot({
        path: join(artifactDirectory, 'chain-tokens-empty-state.png'),
      })
      await emptyState.screenshot({
        path: join(artifactDirectory, 'chain-tokens-empty-state-card.png'),
      })
    }

    // Narrowing the query back to something the native coin matches restores
    // its row without the user having to close the search.
    await search.fill('ET')
    await expect(nativeRow).toBeVisible()
    await expect(emptyState).toHaveCount(0)

    await search.fill(unmatchableQuery)
    await expect(emptyState).toBeVisible()

    await emptyState.getByRole('button', { name: 'Manage tokens' }).click()
    await expect(page.getByText('Choose Tokens', { exact: true })).toBeVisible()

    await page.close()
  })
})
