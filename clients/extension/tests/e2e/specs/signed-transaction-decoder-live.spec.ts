import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from '@playwright/test'

import { extensionPath } from '../extension-path'
import { getAddressForChain } from '../helpers/vault-addresses'
import {
  ensureVaultExists,
  getSecureVaultConfigFromEnv,
} from '../helpers/vault-import'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'
import { SendFlow } from '../page-objects/SendFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const proofDir =
  process.env.SIGNED_TRANSACTION_DECODER_PROOF_DIR ?? 'test-results'
const liveSigningEnabled =
  process.env.SIGNED_TRANSACTION_DECODER_LIVE_TWO_PARTY === 'true' &&
  process.env.ENABLE_TX_SIGNING_TESTS === 'true'
const secureVaultConfigs = getSecureVaultConfigFromEnv()

const launchExtension = async (): Promise<{
  context: BrowserContext
  extensionId: string
}> => {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    viewport: { width: 720, height: 1280 },
    recordVideo: {
      dir: join(proofDir, 'raw-video'),
      size: { width: 720, height: 1280 },
    },
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-popup-blocking',
      '--window-position=-3000,-3000',
      '--window-size=720,1280',
    ],
    permissions: ['notifications'],
  })

  let [background] = context.serviceWorkers()
  if (!background) background = await context.waitForEvent('serviceworker')

  return {
    context,
    extensionId: background.url().split('/')[2],
  }
}

test.describe('signed transaction decoder live two-party flow', () => {
  test.skip(!liveSigningEnabled, 'Live two-party signing is not enabled')
  test.skip(
    secureVaultConfigs.length < 2,
    'Two Secure Vault shares are required for live keysign'
  )

  test('shows one decoded operation through Verify, signing, and Done', async () => {
    test.setTimeout(300_000)
    mkdirSync(proofDir, { recursive: true })

    const initiator = await launchExtension()
    const cosigner = await launchExtension()
    let initiatorPage: Page | undefined
    let cosignerPage: Page | undefined

    try {
      expect(
        await ensureVaultExists(
          initiator.context,
          initiator.extensionId,
          secureVaultConfigs[0].vaultPath,
          secureVaultConfigs[0].password
        )
      ).toBe(true)
      expect(
        await ensureVaultExists(
          cosigner.context,
          cosigner.extensionId,
          secureVaultConfigs[1].vaultPath,
          secureVaultConfigs[1].password
        )
      ).toBe(true)

      const ownThorAddress = await getAddressForChain(initiator.context, 'RUNE')
      expect(ownThorAddress).not.toBeNull()
      if (!ownThorAddress) throw new Error('Secure Vault has no THOR address')

      initiatorPage = await initiator.context.newPage()
      const initiatorVault = new VaultPage(initiatorPage, initiator.extensionId)
      const sendFlow = new SendFlow(initiatorPage, initiator.extensionId)
      const initiatorKeysign = new KeysignProgress(
        initiatorPage,
        initiator.extensionId
      )

      await initiatorVault.goto()
      await initiatorVault.waitForView(15_000)
      await initiatorVault.navigateToSend()
      await sendFlow.waitForView(10_000)
      await sendFlow.selectCoin('RUNE')
      await sendFlow.fillAddress(ownThorAddress)
      await sendFlow.fillAmount('0.000001')
      await initiatorPage.getByText('Add MEMO', { exact: true }).click()
      await initiatorPage
        .getByPlaceholder('Enter Memo')
        .fill(`REBOND:${ownThorAddress}:${ownThorAddress}`)
      await sendFlow.continue()

      await expect(
        initiatorPage.getByText("You're rebonding", { exact: true })
      ).toBeVisible()
      await expect(
        initiatorPage.getByText('0 RUNE', { exact: true })
      ).toHaveCount(0)
      await sendFlow.acceptTerms()
      await initiatorPage.screenshot({
        path: join(proofDir, 'initiator-verify-rebond.png'),
        fullPage: true,
      })

      await sendFlow.sign()
      await expect(
        initiatorPage.getByText('Scan QR', { exact: true })
      ).toBeVisible({ timeout: 30_000 })
      const qrPath = join(proofDir, 'live-keysign-join-qr.png')
      await initiatorPage
        .locator('[data-testid="framed-qr-code"] svg')
        .screenshot({ path: qrPath })

      cosignerPage = await cosigner.context.newPage()
      const cosignerVault = new VaultPage(cosignerPage, cosigner.extensionId)
      const cosignerKeysign = new KeysignProgress(
        cosignerPage,
        cosigner.extensionId
      )
      const cosignerSendFlow = new SendFlow(cosignerPage, cosigner.extensionId)
      await cosignerVault.goto()
      await cosignerVault.waitForView(15_000)
      await cosignerPage.getByRole('button', { name: 'Scan QR' }).click()
      await cosignerPage.getByRole('button', { name: 'Upload QR Code' }).click()
      await cosignerPage.locator('input[type="file"]').setInputFiles(qrPath)
      await cosignerPage.getByRole('button', { name: 'Continue' }).click()

      await expect(
        cosignerPage.getByText("You're rebonding", { exact: true })
      ).toBeVisible({ timeout: 30_000 })
      await expect(
        cosignerPage.getByText('0 RUNE', { exact: true })
      ).toHaveCount(0)
      await cosignerSendFlow.acceptTerms()
      await cosignerPage.screenshot({
        path: join(proofDir, 'cosigner-verify-rebond.png'),
        fullPage: true,
      })

      await cosignerPage.getByRole('button', { name: 'Join Keysign' }).click()

      expect(await initiatorKeysign.waitForComplete(180_000)).toBe('success')
      expect(await cosignerKeysign.waitForComplete(180_000)).toBe('success')
      for (const page of [initiatorPage, cosignerPage]) {
        await expect(
          page.locator('[data-testid="keysign-progress"]')
        ).toHaveAttribute('data-status', /pending|success/, {
          timeout: 30_000,
        })
        await page.waitForTimeout(1_000)
      }
      await expect(
        initiatorPage.getByText('Rebonded', { exact: true })
      ).toBeVisible()
      await expect(
        cosignerPage.getByText('Rebonded', { exact: true })
      ).toBeVisible()

      const txHash = await initiatorKeysign.getTxHash()
      expect(txHash).not.toBeNull()
      if (!txHash) throw new Error('Initiator Done screen has no tx hash')
      expect(await cosignerKeysign.getTxHash()).toBe(txHash)
      writeFileSync(
        join(proofDir, 'live-flow-receipt.json'),
        JSON.stringify(
          {
            observedAt: new Date().toISOString(),
            chain: 'THORChain',
            sender: ownThorAddress,
            receiver: ownThorAddress,
            amountBaseUnits: '100',
            memo: `REBOND:${ownThorAddress}:${ownThorAddress}`,
            txHash,
          },
          null,
          2
        )
      )
      await initiatorPage.screenshot({
        path: join(proofDir, 'initiator-done-rebond.png'),
        fullPage: true,
      })
      await cosignerPage.screenshot({
        path: join(proofDir, 'cosigner-done-rebond.png'),
        fullPage: true,
      })

      const initiatorVideo = initiatorPage.video()
      const cosignerVideo = cosignerPage.video()
      await initiatorPage.close()
      await cosignerPage.close()
      initiatorPage = undefined
      cosignerPage = undefined
      await initiatorVideo?.saveAs(join(proofDir, 'initiator-live-flow.webm'))
      await cosignerVideo?.saveAs(join(proofDir, 'cosigner-live-flow.webm'))
    } finally {
      await initiatorPage?.close().catch(() => undefined)
      await cosignerPage?.close().catch(() => undefined)
      await initiator.context.close()
      await cosigner.context.close()
    }
  })
})
