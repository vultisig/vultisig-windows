import { join } from 'node:path'

import { create } from '@bufbuild/protobuf'
import type { BrowserContext, Page } from '@playwright/test'
import { getJoinKeysignUrl } from '@vultisig/core-mpc/keysign/utils/getJoinKeysignUrl'
import { RippleSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import QRCode from 'react-qr-code'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { enableChains } from '../helpers/enable-chains'
import { SendFlow } from '../page-objects/SendFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const classicAddress = 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY'
const taggedXAddress = 'XV5sbjUmgPpvXv4ixFWZ5ptAYZ6PD2q1qM6owqNbug8W6KV'
const proofDir = process.env.XRP_DESTINATION_TAG_PROOF_DIR ?? 'test-results'
const fixturePublicKey =
  '02acb4bc267db7774614bf6011c59929b006c2554386a3090baff0b3fc418ec044'

const captureProof = async (page: Page, name: string) => {
  await page.mouse.move(0, 0)
  await page.waitForTimeout(1_000)
  await page.screenshot({
    path: join(proofDir, name),
    fullPage: true,
  })
}

// Always the synthetic fixture: the assertions below are written against it,
// and the real test vault's unfunded XRP account cannot reach Verify.
const ensureDestinationTagVault = async (context: BrowserContext) => {
  await writeChromeStorageMultiple(context, {
    currentVaultId: fixturePublicKey,
    hasFinishedOnboarding: true,
    latestInstalledVersion: '0.2.1',
    latestMigration: 'removeDuplicateCoins',
    vaults: [
      {
        name: 'XRP Destination Tag QA',
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
        {
          address: classicAddress,
          chain: 'Ripple',
          decimals: 6,
          logo: 'xrp',
          priceProviderId: 'ripple',
          ticker: 'XRP',
        },
      ],
    },
  })
}

test.describe('XRP destination tag', () => {
  test.beforeEach(async ({ context }) => {
    test.setTimeout(300_000)
    await ensureDestinationTagVault(context)
  })

  const openRippleSendForm = async ({
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
    const ripple = await enableChains({ page, chains: ['ripple'] })
    expect(ripple.missing).toEqual([])
    await vaultPage.navigateToSend()
    await sendFlow.waitForView(15_000)
    await sendFlow.selectCoin('XRP')
    await expect(
      sendFlow.sendForm.getByText('Ripple', { exact: true })
    ).toBeVisible()

    const openAddressField = async () => {
      if (!(await sendFlow.addressInput.isVisible())) {
        const field = page.getByTestId('send-address-field')
        await field.scrollIntoViewIfNeeded()
        await field.click({ force: true, position: { x: 12, y: 12 } })
        await expect(sendFlow.addressInput).toBeVisible()
      }
    }

    await openAddressField()
    return { page, sendFlow }
  }

  test('renders manual validation and the send overview', async ({
    context,
    extensionId,
  }) => {
    const { page, sendFlow } = await openRippleSendForm({
      context,
      extensionId,
    })

    await sendFlow.fillAddress(classicAddress)
    await expect(sendFlow.destinationTagInput).toBeVisible()
    await sendFlow.destinationTagInput.pressSequentially('12345')
    await expect(sendFlow.destinationTagInput).toBeEnabled()
    await expect(sendFlow.destinationTagInput).toHaveValue('12345')
    await sendFlow.destinationTagInput.scrollIntoViewIfNeeded()
    await captureProof(page, 'xrp-destination-tag-manual.png')

    await sendFlow.destinationTagInput.fill('4294967296')
    const validationError = page.getByText(
      'Enter a whole number between 0 and 4,294,967,295.'
    )
    await expect(validationError).toBeVisible()
    await validationError.scrollIntoViewIfNeeded()
    await captureProof(page, 'xrp-destination-tag-invalid.png')

    await sendFlow.destinationTagInput.fill('')
    await sendFlow.destinationTagInput.pressSequentially('12345678901')
    await expect(sendFlow.destinationTagInput).toHaveValue('12345678901')
    await expect(validationError).toBeVisible()

    await sendFlow.destinationTagInput.fill('12345')
    await sendFlow.fillAmount('0.000001')
    await sendFlow.continue()
    await expect(page.getByText('Send Overview')).toBeVisible()
    await expect(
      page.getByText('Destination tag', { exact: true })
    ).toBeVisible()
    await expect(page.getByText('12345', { exact: true })).toBeVisible()
    await captureProof(page, 'xrp-destination-tag-overview.png')
  })

  test('autofills and locks the tag from an X-address', async ({
    context,
    extensionId,
  }) => {
    const { page, sendFlow } = await openRippleSendForm({
      context,
      extensionId,
    })

    await sendFlow.fillAddress(taggedXAddress)
    await expect(sendFlow.destinationTagInput).toHaveValue('495')
    await expect(sendFlow.destinationTagInput).toBeDisabled()
    await sendFlow.destinationTagInput.scrollIntoViewIfNeeded()
    await captureProof(page, 'xrp-destination-tag-x-address.png')
  })

  test('shows the signed tag separately from the memo to a co-signer', async ({
    context,
    extensionId,
  }) => {
    const destinationTag = 12345
    const memo = 'invoice-4300'
    const payload = create(KeysignPayloadSchema, {
      coin: create(CoinSchema, {
        address: classicAddress,
        chain: 'Ripple',
        decimals: 6,
        hexPublicKey: fixturePublicKey,
        isNativeToken: true,
        logo: 'xrp',
        priceProviderId: 'ripple',
        ticker: 'XRP',
      }),
      toAddress: classicAddress,
      toAmount: '1',
      memo,
      blockchainSpecific: {
        case: 'rippleSpecific',
        value: create(RippleSpecificSchema, { destinationTag }),
      },
    })
    const joinUrl = await getJoinKeysignUrl({
      serverType: 'relay',
      serviceName: 'xrp-destination-tag-qa',
      sessionId: 'xrp-destination-tag-qa',
      hexEncryptionKey: '0'.repeat(64),
      payload: { keysign: payload },
      vaultId: fixturePublicKey,
    })

    const qrPage = await context.newPage()
    await qrPage.setContent(
      renderToStaticMarkup(
        createElement(QRCode, { level: 'L', size: 900, value: joinUrl })
      )
    )
    const qrPath = join(proofDir, 'xrp-destination-tag-join-qr.png')
    await qrPage.locator('svg').screenshot({ path: qrPath })
    await qrPage.close()

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    await vaultPage.goto()
    await vaultPage.waitForView(15_000)
    await page.getByRole('button', { name: 'Scan QR' }).click()

    await page.getByRole('button', { name: 'Upload QR Code' }).click()
    await page.locator('input[type="file"]').setInputFiles(qrPath)
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Verify', { exact: true })).toBeVisible()
    const destinationTagLabel = page.getByText('Destination tag', {
      exact: true,
    })
    await expect(destinationTagLabel).toBeVisible()
    await expect(
      page.getByText(destinationTag.toString(), { exact: true })
    ).toBeVisible()
    await expect(page.getByText(memo, { exact: true })).toBeVisible()
    await destinationTagLabel.evaluate(element =>
      element.scrollIntoView({ block: 'center' })
    )
    await captureProof(page, 'xrp-destination-tag-cosigner-overview.png')
  })
})
