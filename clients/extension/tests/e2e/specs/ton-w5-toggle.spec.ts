/**
 * Developer Options → "Use TON W5 wallet".
 *
 * A synthetic vault (real Ed25519 public key, placeholder key shares) with a
 * native TON coin and a jetton is seeded straight into chrome.storage.local.
 * Flipping the switch must move both coins to the address the W5 contract
 * derives for that key, persist the flag, and — the regression this pins —
 * refresh the switch itself, so the next click turns it back off and moves
 * the coins back. No network: everything is local derivation and storage.
 */
import { expect } from '@playwright/test'

import { test } from '../fixtures/extension.fixture'
import {
  readChromeStorage,
  writeChromeStorageMultiple,
} from '../helpers/chrome-storage'

const v4r2Address = 'UQCf6aQfV3vc8KLtPI_lROY64hUeR1oyNfdbwXB-gwDaKZmi'
const w5Address = 'UQCvaZohosTA0ak9ZFMs-cvL1JrXqogqJH8sI2uO6k8clJpn'
const ecdsa = `02${'ab'.repeat(32)}`

const vault = {
  name: 'TON W5 toggle vault',
  publicKeys: { ecdsa, eddsa: 'aa'.repeat(32) },
  signers: ['device-1', 'Server-1'],
  createdAt: Date.now(),
  hexChainCode: 'bb'.repeat(32),
  keyShares: { ecdsa: 'placeholder', eddsa: 'placeholder' },
  localPartyId: 'device-1',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
  lastPasswordVerificationTime: Date.now(),
}

const tonCoins = [
  {
    chain: 'Ton',
    address: v4r2Address,
    ticker: 'TON',
    decimals: 9,
    logo: 'ton',
    priceProviderId: 'the-open-network',
  },
  {
    chain: 'Ton',
    id: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    address: v4r2Address,
    ticker: 'USDT',
    decimals: 6,
    logo: 'usdt',
  },
]

type StoredCoin = { chain: string; address: string }

test('the TON W5 switch moves the coins, persists, and can be turned back off', async ({
  context,
  extensionId,
}) => {
  test.setTimeout(120_000)
  await writeChromeStorageMultiple(context, {
    vaults: [vault],
    currentVaultId: ecdsa,
    vaultsCoins: { [ecdsa]: tonCoins },
    hasFinishedOnboarding: true,
    hasSeenNotificationPrompt: true,
  })

  const page = await context.newPage()
  await page.goto(`chrome-extension://${extensionId}/index.html`)
  await page
    .locator('[data-testid="settings-button"]')
    .first()
    .click({ timeout: 60_000 })

  const version = page.getByText(/\d+\.\d+\.\d+/).last()
  await version.waitFor({ timeout: 30_000 })
  await version.click()
  await version.click()
  await version.click()
  await page.getByText('Developer Options').waitFor({ timeout: 15_000 })

  const w5Switch = page.getByRole('switch', { name: 'Use TON W5 wallet' })
  await expect(w5Switch).toHaveAttribute('aria-checked', 'false')

  const tonAddresses = async () => {
    const coins =
      (await readChromeStorage<Record<string, StoredCoin[]>>(
        context,
        'vaultsCoins'
      )) ?? {}
    return (coins[ecdsa] ?? [])
      .filter(coin => coin.chain === 'Ton')
      .map(coin => coin.address)
  }

  await w5Switch.click()
  await expect(w5Switch).toHaveAttribute('aria-checked', 'true', {
    timeout: 30_000,
  })
  await expect
    .poll(() => readChromeStorage(context, 'isTonW5Enabled'))
    .toBe(true)
  await expect.poll(tonAddresses).toEqual([w5Address, w5Address])

  await w5Switch.click()
  await expect(w5Switch).toHaveAttribute('aria-checked', 'false', {
    timeout: 30_000,
  })
  await expect
    .poll(() => readChromeStorage(context, 'isTonW5Enabled'))
    .toBe(false)
  await expect.poll(tonAddresses).toEqual([v4r2Address, v4r2Address])
})
