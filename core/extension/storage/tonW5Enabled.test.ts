/**
 * The TON W5 developer toggle, below the React glue: the real extension
 * storage adapters writing through `chrome.storage.local`, the real
 * `getChainAddress` on the real WalletCore WASM, and the coin move the toggle
 * performs. A flip must land every TON coin — native and jetton — on the
 * address of the chosen contract, and flipping back must restore the original.
 */
import { StorageKey } from '@core/ui/storage/StorageKey'
import { moveTonCoinsToWalletVersion } from '@core/ui/storage/tonW5Enabled'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { coinsStorage } from './coins'
import { tonW5EnabledStorage } from './tonW5Enabled'

const v4r2Address = 'UQCf6aQfV3vc8KLtPI_lROY64hUeR1oyNfdbwXB-gwDaKZmi'
const w5Address = 'UQCvaZohosTA0ak9ZFMs-cvL1JrXqogqJH8sI2uO6k8clJpn'

const vault: Vault = {
  name: 'W5 toggle vault',
  publicKeys: { ecdsa: `02${'ab'.repeat(32)}`, eddsa: 'aa'.repeat(32) },
  signers: ['device-1', 'device-2'],
  hexChainCode: 'bb'.repeat(32),
  keyShares: { ecdsa: '', eddsa: '' },
  localPartyId: 'device-1',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
}

const tonCoins: AccountCoin[] = [
  {
    chain: Chain.Ton,
    address: v4r2Address,
    ticker: 'TON',
    decimals: 9,
    logo: 'ton',
  },
  {
    chain: Chain.Ton,
    id: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    address: v4r2Address,
    ticker: 'USDT',
    decimals: 6,
    logo: 'usdt',
  },
]

let walletCore: WalletCore

beforeAll(async () => {
  walletCore = await initWasm()
})

beforeEach(async () => {
  const store: Record<string, unknown> = {}
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: async (key: string) => ({ [key]: store[key] }),
        set: async (items: Record<string, unknown>) => {
          Object.assign(store, items)
        },
      },
    },
  })
  await chrome.storage.local.set({
    [StorageKey.vaultsCoins]: { [getVaultId(vault)]: tonCoins },
  })
})

const addressesOfStoredTonCoins = async () => {
  const coins = await coinsStorage.getCoins()

  return (coins[getVaultId(vault)] ?? [])
    .filter(coin => coin.chain === Chain.Ton)
    .map(coin => coin.address)
}

const move = (tonWalletVersion: 'v4r2' | 'v5r1') =>
  moveTonCoinsToWalletVersion({
    vaults: [{ ...vault, coins: tonCoins }],
    walletCore,
    tonWalletVersion,
    createCoin: coinsStorage.createCoin,
    deleteCoin: coinsStorage.deleteCoin,
  })

describe('TON W5 developer toggle', () => {
  it('persists the flag through the extension storage adapter', async () => {
    expect(await tonW5EnabledStorage.getIsTonW5Enabled()).toBe(false)

    await tonW5EnabledStorage.setIsTonW5Enabled(true)

    expect(await tonW5EnabledStorage.getIsTonW5Enabled()).toBe(true)
  })

  it('moves the native coin and its jettons to the W5 address, and back', async () => {
    await move('v5r1')
    expect(await addressesOfStoredTonCoins()).toEqual([w5Address, w5Address])

    await move('v4r2')
    expect(await addressesOfStoredTonCoins()).toEqual([
      v4r2Address,
      v4r2Address,
    ])
  })

  it('keeps everything about the coins except the address', async () => {
    await move('v5r1')
    const coins = await coinsStorage.getCoins()

    expect(coins[getVaultId(vault)]).toEqual(
      tonCoins.map(coin => ({ ...coin, address: w5Address }))
    )
  })
})
