import { join } from 'node:path'

import type { Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { enableChains } from '../helpers/enable-chains'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
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

const ensureDestinationTagVault = async (
  context: Parameters<typeof ensureVaultExists>[0],
  extensionId: string
) => {
  const config = getVaultConfigFromEnv()
  if (config) {
    await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )
    return
  }

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
  test.beforeEach(async ({ context, extensionId }) => {
    test.setTimeout(300_000)
    await ensureDestinationTagVault(context, extensionId)
  })

  const openRippleSendForm = async ({
    context,
    extensionId,
  }: {
    context: Parameters<typeof ensureVaultExists>[0]
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
})
