import type { BrowserContext, Page, TestInfo } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { createSeededVault } from '../helpers/seeded-vault'
import { SendFlow } from '../page-objects/SendFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const ethereumAddress = '0x0000000000000000000000000000000000000001'
const rippleAddress = 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY'

const ethereum = {
  address: ethereumAddress,
  chain: 'Ethereum',
  decimals: 18,
  isNativeToken: true,
  logo: 'eth',
  priceProviderId: 'ethereum',
  ticker: 'ETH',
}

const ethereumUsdc = {
  address: ethereumAddress,
  chain: 'Ethereum',
  decimals: 6,
  id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  isNativeToken: false,
  logo: 'usdc',
  priceProviderId: 'usd-coin',
  ticker: 'USDC',
}

const ripple = {
  address: rippleAddress,
  chain: 'Ripple',
  decimals: 6,
  isNativeToken: true,
  logo: 'xrp',
  priceProviderId: 'ripple',
  ticker: 'XRP',
}

const seedVault = async (
  context: BrowserContext,
  { includeRipple = true }: { includeRipple?: boolean } = {}
) => {
  const { vaultId, vault } = await createSeededVault({
    name: 'Send Coin Selection QA',
  })

  await writeChromeStorageMultiple(context, {
    currentVaultId: vaultId,
    hasFinishedOnboarding: true,
    latestInstalledVersion: '0.2.1',
    latestMigration: 'removeDuplicateCoins',
    vaults: [vault],
    vaultsCoins: {
      [vaultId]: [ethereum, ethereumUsdc, ...(includeRipple ? [ripple] : [])],
    },
  })
}

const openSendForm = async ({
  context,
  extensionId,
}: {
  context: BrowserContext
  extensionId: string
}) => {
  const page = await context.newPage()
  const vaultPage = new VaultPage(page, extensionId)
  const sendFlow = new SendFlow(page, extensionId)

  await vaultPage.goto()
  await vaultPage.waitForView(15_000)
  await vaultPage.navigateToSend()
  await sendFlow.waitForView(15_000)

  return { page, sendFlow }
}

const captureProof = async ({
  name,
  page,
  testInfo,
}: {
  name: string
  page: Page
  testInfo: TestInfo
}) => {
  const path = testInfo.outputPath(`${name}.png`)
  await page.waitForTimeout(500)
  await page.screenshot({ path, fullPage: true })
  await testInfo.attach(name, { path, contentType: 'image/png' })
}

test.describe('send coin selection', () => {
  test('selects the requested chain and asset before filling the recipient', async ({
    context,
    extensionId,
  }, testInfo) => {
    await seedVault(context)
    const { page, sendFlow } = await openSendForm({ context, extensionId })

    await page.evaluate(() => {
      const decoy = document.createElement('button')
      decoy.dataset.testid = 'coin-option-XRP'
      decoy.dataset.clicked = 'false'
      decoy.id = 'send-coin-selection-background-decoy'
      decoy.textContent = 'XRP'
      decoy.style.position = 'fixed'
      decoy.style.bottom = '4px'
      decoy.style.right = '4px'
      document.body.append(decoy)
      decoy.addEventListener('click', () => {
        decoy.dataset.clicked = 'true'
      })
    })

    await sendFlow.selectCoin('XRP')
    expect(await sendFlow.getSelectedCoin()).toEqual({
      chain: 'Ripple',
      ticker: 'XRP',
    })
    await expect(
      page.locator('#send-coin-selection-background-decoy')
    ).toHaveAttribute('data-clicked', 'false')
    await page
      .locator('#send-coin-selection-background-decoy')
      .evaluate(node => {
        node.remove()
      })

    await sendFlow.openAddressField()
    await sendFlow.fillAddress(rippleAddress)
    await expect(sendFlow.addressInput).toHaveValue(rippleAddress)

    // A valid recipient auto-advances the form to Amount. Repeating the same
    // request must verify the current selection and restore that step.
    await expect(sendFlow.step('amount')).toHaveAttribute(
      'aria-current',
      'step'
    )
    await sendFlow.selectCoin('XRP')
    await expect(sendFlow.step('amount')).toHaveAttribute(
      'aria-current',
      'step'
    )
    await sendFlow.openAddressField()
    await expect(sendFlow.addressInput).toHaveValue(rippleAddress)

    // The Ripple recipient is not an Ethereum address, so after switching
    // chains the form stays on Address and Amount cannot be opened.
    await sendFlow.selectCoin('ETH')
    await sendFlow.selectCoin('USDC')
    await expect(sendFlow.step('address')).toHaveAttribute(
      'aria-current',
      'step'
    )
    await expect(sendFlow.step('amount')).toBeDisabled()
    expect(await sendFlow.getSelectedCoin()).toEqual({
      chain: 'Ethereum',
      ticker: 'USDC',
    })
    await sendFlow.openAddressField()

    await captureProof({
      name: 'send-coin-selection-success',
      page,
      testInfo,
    })
    await page.close()
  })

  test('rejects a missing chain before recipient or amount changes', async ({
    context,
    extensionId,
  }, testInfo) => {
    await seedVault(context, { includeRipple: false })
    const { page, sendFlow } = await openSendForm({ context, extensionId })

    await expect(
      sendFlow.prepareSend('XRP', rippleAddress, '1')
    ).rejects.toThrow(/Unable to select XRP.*chain:Ripple.*missing/)

    await sendFlow.openAddressField()
    await expect(sendFlow.addressInput).toHaveValue('')
    // Without a valid recipient the amount step stays closed.
    await expect(sendFlow.step('amount')).toBeDisabled()

    await captureProof({
      name: 'send-coin-selection-missing-chain',
      page,
      testInfo,
    })
    await page.close()
  })

  test('rejects ambiguous options instead of clicking the first match', async ({
    context,
    extensionId,
  }) => {
    await seedVault(context)
    const { page, sendFlow } = await openSendForm({ context, extensionId })

    await page.evaluate(() => {
      const observer = new MutationObserver(() => {
        const option = document.querySelector('[data-testid="coin-option-XRP"]')
        if (
          !option ||
          document.querySelector('[data-selection-decoy="true"]')
        ) {
          return
        }

        const duplicate = option.cloneNode(true)
        if (!(duplicate instanceof HTMLElement)) return

        duplicate.dataset.selectionDecoy = 'true'
        option.parentElement?.append(duplicate)
      })
      observer.observe(document.body, { childList: true, subtree: true })
    })

    expect((await sendFlow.getSelectedCoin()).ticker).not.toBe('XRP')
    await expect(sendFlow.selectCoin('XRP')).rejects.toThrow(
      /asset:XRP ambiguous \(2 matches\)/
    )
    await page.close()
  })
})
