import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { create } from '@bufbuild/protobuf'
import { getJoinKeysignUrl } from '@vultisig/core-mpc/keysign/utils/getJoinKeysignUrl'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import QRCode from 'react-qr-code'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { VaultPage } from '../page-objects/VaultPage.po'

const fixturePublicKey =
  '02acb4bc267db7774614bf6011c59929b006c2554386a3090baff0b3fc418ec044'
const proofDir =
  process.env.SIGNED_TRANSACTION_DECODER_PROOF_DIR ?? 'test-results'

test.describe('signed transaction decoder', () => {
  test.beforeEach(async ({ context }) => {
    await writeChromeStorageMultiple(context, {
      currentVaultId: fixturePublicKey,
      hasFinishedOnboarding: true,
      latestInstalledVersion: '0.2.1',
      latestMigration: 'removeDuplicateCoins',
      vaults: [
        {
          name: 'Signed Decoder QA',
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
            address: 'thor1sender',
            chain: 'THORChain',
            decimals: 8,
            logo: 'rune',
            priceProviderId: 'thorchain',
            ticker: 'RUNE',
          },
        ],
      },
    })
  })

  test('shows the signed THOR rebond operation to a Korean co-signer', async ({
    context,
    extensionId,
  }) => {
    mkdirSync(proofDir, { recursive: true })
    const payload = create(KeysignPayloadSchema, {
      coin: create(CoinSchema, {
        address: 'thor1sender',
        chain: 'THORChain',
        decimals: 8,
        hexPublicKey: fixturePublicKey,
        isNativeToken: true,
        logo: 'rune',
        priceProviderId: 'thorchain',
        ticker: 'RUNE',
      }),
      toAddress: 'thor1node',
      toAmount: '0',
      memo: 'REBOND:thor1node:thor1newprovider',
    })
    const joinUrl = await getJoinKeysignUrl({
      serverType: 'relay',
      serviceName: 'signed-decoder-qa',
      sessionId: 'signed-decoder-qa',
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
    const qrPath = join(proofDir, 'signed-decoder-join-qr.png')
    await qrPage.locator('svg').screenshot({ path: qrPath })
    await qrPage.close()

    await writeChromeStorageMultiple(context, { language: 'ko' })
    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    await vaultPage.goto()
    await vaultPage.waitForView(15_000)
    await page.getByRole('button', { name: 'QR 코드를 스캔하세요' }).click()
    await page.getByRole('button', { name: 'QR 코드 업로드' }).click()
    await page.locator('input[type="file"]').setInputFiles(qrPath)
    await page.getByRole('button', { name: '계속하다' }).click()

    await expect(
      page.getByText('재본딩 중이에요', { exact: true })
    ).toBeVisible()
    await expect(page.getByText('0 RUNE', { exact: true })).toHaveCount(0)

    await page.screenshot({
      path: join(proofDir, 'signed-decoder-cosigner-rebond.png'),
      fullPage: true,
    })
    await page.close()
  })
})
