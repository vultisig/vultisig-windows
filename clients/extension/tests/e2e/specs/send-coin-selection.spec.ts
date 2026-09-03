import type { BrowserContext, Page, TestInfo } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { SendFlow } from '../page-objects/SendFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const fixturePublicKey =
  '02acb4bc267db7774614bf6011c59929b006c2554386a3090baff0b3fc418ec044'
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
  await writeChromeStorageMultiple(context, {
    currentVaultId: fixturePublicKey,
    hasFinishedOnboarding: true,
    latestInstalledVersion: '0.2.1',
    latestMigration: 'removeDuplicateCoins',
    vaults: [
      {
        name: 'Send Coin Selection QA',
        publicKeys: {
          ecdsa: fixturePublicKey,
          eddsa: '0'.repeat(64),
        },
        signers: ['local-device'],
        createdAt: Date.now(),
        hexChainCode: '0'.repeat(64),
        keyShares: { ecdsa: '', eddsa: '' },
        localPartyId: 'local-device',
        libType: 'DKLS',
        isBackedUp: true,
        order: 0,
      },
    ],
    vaultsCoins: {
      [fixturePublicKey]: [
        ethereum,
        ethereumUsdc,
        ...(includeRipple ? [ripple] : []),
      ],
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

const captureProof = async (page: Page, testInfo: TestInfo, name: string) => {
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
    await expect(sendFlow.chainSelectorButton).toHaveText('Ripple')
    await expect(sendFlow.coinSelectorTrigger).toContainText('XRP')
    await expect(page.getByText('Select asset', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Select chain', { exact: true })).toHaveCount(0)
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
    // request must verify the current selection and restore that active field.
    await sendFlow.selectCoin('XRP')
    await expect
      .poll(() =>
        sendFlow.amountInput.locator('xpath=ancestor::*[@inert]').count()
      )
      .toBe(0)
    await expect(sendFlow.addressInput).toHaveValue(rippleAddress)

    await sendFlow.selectCoin('ETH')
    await sendFlow.selectCoin('USDC')
    await expect
      .poll(() =>
        sendFlow.amountInput.locator('xpath=ancestor::*[@inert]').count()
      )
      .toBe(0)
    await page.getByTestId('send-coin-field').click()
    await expect(sendFlow.chainSelectorButton).toHaveText('Ethereum')
    await expect(sendFlow.coinSelectorTrigger).toContainText('USDC')
    await sendFlow.openAmountField()

    await captureProof(page, testInfo, 'send-coin-selection-success')
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
    await expect(page.getByText('Select asset', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Select chain', { exact: true })).toHaveCount(0)

    await sendFlow.openAddressField()
    await expect(sendFlow.addressInput).toHaveValue('')
    await sendFlow.openAmountField()
    await expect(sendFlow.amountInput).toHaveValue('')

    await captureProof(page, testInfo, 'send-coin-selection-missing-chain')
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

        const duplicate = option.cloneNode(true) as HTMLElement
        duplicate.dataset.selectionDecoy = 'true'
        option.parentElement?.append(duplicate)
      })
      observer.observe(document.body, { childList: true, subtree: true })
    })

    await expect(sendFlow.selectCoin('XRP')).rejects.toThrow(
      /asset:XRP ambiguous \(2 matches\)/
    )
    await expect(page.getByText('Select asset', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Select chain', { exact: true })).toHaveCount(0)
    await page.close()
  })
})
