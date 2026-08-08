/**
 * Secure Vault Flows E2E Tests
 *
 * Exercises real Secure Vault UI state without completing signing. A second
 * device is deliberately absent, so the signing case must remain at the
 * waiting/QR step and must never reach success.
 */

import { expect, test } from '../fixtures/extension-loader'
import { getAddressForChain } from '../helpers/vault-addresses'
import {
  ensureVaultExists,
  getSecureVaultConfigFromEnv,
} from '../helpers/vault-import'
import { KeysignProgress } from '../page-objects/KeysignProgress.po'
import { SendFlow } from '../page-objects/SendFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const [secureVaultConfig] = getSecureVaultConfigFromEnv()
const signingTestsEnabled = process.env.ENABLE_TX_SIGNING_TESTS === 'true'

test.describe('Secure Vault Flows', () => {
  test.skip(!secureVaultConfig, 'Secure Vault QA shares are not configured')

  test.beforeEach(async ({ context, extensionId }) => {
    if (!secureVaultConfig) {
      throw new Error('Secure Vault QA shares are not configured')
    }

    const imported = await ensureVaultExists(
      context,
      extensionId,
      secureVaultConfig.vaultPath,
      secureVaultConfig.password
    )

    expect(
      imported,
      'Secure Vault import must succeed before exercising the flow'
    ).toBe(true)
  })

  test('Secure Vault appears in the vault view', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      await expect(vaultPage.vaultContainer).toBeVisible()
      await expect(vaultPage.sendButton).toBeVisible()
    } finally {
      await page.close()
    }
  })

  test('balance display renders for Secure Vault', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)

      const balance = await vaultPage.getTotalBalance()
      expect(balance.trim().length).toBeGreaterThan(0)
    } finally {
      await page.close()
    }
  })

  test('signing waits for a second device and shows a QR code', async ({
    context,
    extensionId,
  }) => {
    test.skip(!signingTestsEnabled, 'TX signing tests are disabled')

    const ownAddress = await getAddressForChain(context, 'ETH')
    expect(
      ownAddress,
      'The Secure Vault must expose its own Ethereum address'
    ).not.toBeNull()
    if (!ownAddress) {
      throw new Error('The Secure Vault has no Ethereum self-send address')
    }

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    const sendFlow = new SendFlow(page, extensionId)
    const keysignProgress = new KeysignProgress(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView(15_000)
      await vaultPage.navigateToSend()
      await sendFlow.waitForView(10_000)
      await sendFlow.selectCoin('ETH')
      await sendFlow.fillAddress(ownAddress)
      await sendFlow.fillAmount('0.000001')
      await sendFlow.continue()
      await sendFlow.acceptTerms()
      await sendFlow.sign()

      await keysignProgress.waitForWaitingForDevices(30_000)
      await expect(keysignProgress.qrCode).toBeVisible()
      await expect(keysignProgress.broadcastingPhase).not.toBeVisible()
      await expect(keysignProgress.keysignSuccess).not.toBeVisible()
      await expect(keysignProgress.successScreen).not.toBeVisible()

      await page.waitForTimeout(5_000)
      await expect(keysignProgress.waitingForDevices).toBeVisible()
      await expect(keysignProgress.qrCode).toBeVisible()
      await expect(keysignProgress.broadcastingPhase).not.toBeVisible()
      await expect(keysignProgress.keysignSuccess).not.toBeVisible()
      await expect(keysignProgress.successScreen).not.toBeVisible()
    } finally {
      await page.close()
    }
  })
})
