import path from 'path'
import { fileURLToPath } from 'url'

import { expect, test } from '../fixtures/extension-loader'
import { writeChromeStorageMultiple } from '../helpers/chrome-storage'
import { createSeededVault } from '../helpers/seeded-vault'
import { SendFlow } from '../page-objects/SendFlow.po'
import { VaultPage } from '../page-objects/VaultPage.po'

const vaultName = 'QR Send Deeplink QA'
const recipientAddress = '0x0000000000000000000000000000000000000002'

// Encodes the send request the iOS and Android apps put in a QR:
// vultisig://send?assetChain=Ethereum&assetTicker=ETH&toAddress=<recipientAddress>&amount=0.001
const sendDeeplinkQrPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/vultisig-send-deeplink-qr.png'
)

test.describe('QR upload', () => {
  test('opens a mobile send QR with the recipient and amount filled in (#5149)', async ({
    context,
    extensionId,
  }) => {
    const { vaultId, vault } = await createSeededVault({ name: vaultName })

    await writeChromeStorageMultiple(context, {
      currentVaultId: vaultId,
      hasFinishedOnboarding: true,
      latestInstalledVersion: '0.2.1',
      latestMigration: 'removeDuplicateCoins',
      vaults: [vault],
      vaultsCoins: {
        [vaultId]: [
          {
            address: '0x0000000000000000000000000000000000000001',
            chain: 'Ethereum',
            decimals: 18,
            isNativeToken: true,
            logo: 'eth',
            priceProviderId: 'ethereum',
            ticker: 'ETH',
          },
        ],
      },
    })

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)
    await vaultPage.goto()
    await vaultPage.waitForView(15_000)

    await page.getByTestId('bottom-navigation-scan').click()
    await page.getByRole('button', { name: 'Upload QR Code' }).click()
    await page.locator('input[type="file"]').setInputFiles(sendDeeplinkQrPath)
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByText(vaultName, { exact: true }).click()

    const sendFlow = new SendFlow(page, extensionId)
    await sendFlow.waitForView(15_000)
    await sendFlow.openAddressField()
    await expect(sendFlow.addressInput).toHaveValue(recipientAddress)
    await sendFlow.openAmountField()
    await expect(sendFlow.amountInput).toHaveValue('0.001')

    await page.close()
  })
})
