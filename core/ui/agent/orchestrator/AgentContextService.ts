import { Chain } from '@core/chain/Chain'
import { getCoinBalance } from '@core/chain/coin/balance'
import { attempt, withFallback } from '@lib/utils/attempt'

import type { VaultMeta } from '../tools/types'
import { buildMessageContext } from './AgentContextBuilder'
import type { BalanceInfo, MessageContext } from './types'

export type VaultData = {
  name: string
  publicKeyEcdsa: string
  publicKeyEddsa: string
  hexChainCode: string
  localPartyId: string
  resharePrefix: string
  libType: string
  signers: string[]
  keyShares: Array<{ publicKey: string; keyShare: string }>
}

export type CoinData = {
  chain: string
  ticker: string
  address: string
  contractAddress?: string
  decimals: number
  logo?: string
  priceProviderId?: string
  isNativeToken: boolean
  id?: string
}

export type AddressBookItem = {
  title: string
  address: string
  chain: string
}

type ContextDeps = {
  getVault: (pubKey: string) => Promise<VaultData>
  getVaultCoins: (pubKey: string) => Promise<CoinData[]>
  getAddressBookItems: () => Promise<AddressBookItem[]>
}

function formatBalance(raw: bigint, decimals: number, maxDecimals = 6): string {
  if (raw === 0n) return '0'

  const divisor = 10n ** BigInt(decimals)
  const whole = raw / divisor
  const remainder = raw % divisor

  if (remainder === 0n) return whole.toString()

  let remainderStr = remainder.toString().padStart(decimals, '0')
  remainderStr = remainderStr.replace(/0+$/, '')
  if (!remainderStr) return whole.toString()
  if (remainderStr.length > maxDecimals) {
    remainderStr = remainderStr.slice(0, maxDecimals)
  }

  return `${whole}.${remainderStr}`
}

export class AgentContextService {
  private deps: ContextDeps
  private preloadedCtx: MessageContext | null = null
  private preloadedPubKey: string | null = null

  constructor(deps: ContextDeps) {
    this.deps = deps
  }

  async preloadContext(vaultPubKey: string): Promise<void> {
    const result = await attempt(() => this.buildCtx(vaultPubKey))
    if ('error' in result) return

    this.preloadedCtx = result.data
    this.preloadedPubKey = vaultPubKey
  }

  takePreloadedContext(vaultPubKey: string): MessageContext | null {
    if (this.preloadedPubKey === vaultPubKey && this.preloadedCtx) {
      const ctx = this.preloadedCtx
      this.preloadedCtx = null
      this.preloadedPubKey = null
      return ctx
    }
    return null
  }

  async buildCtx(vaultPubKey: string): Promise<MessageContext> {
    const [vault, coins, addressBookItems] = await Promise.all([
      this.deps.getVault(vaultPubKey),
      this.deps.getVaultCoins(vaultPubKey),
      this.deps.getAddressBookItems().catch(() => []),
    ])

    const balances = await this.fetchBalances(coins)

    return buildMessageContext({
      vaultPubKey,
      vaultName: vault.name,
      coins,
      balances,
      addressBookItems,
    })
  }

  async buildQuickCtx(vaultPubKey: string): Promise<MessageContext> {
    const [vault, coins] = await Promise.all([
      this.deps.getVault(vaultPubKey),
      this.deps.getVaultCoins(vaultPubKey),
    ])

    return buildMessageContext({
      vaultPubKey,
      vaultName: vault.name,
      coins,
    })
  }

  async buildVaultMeta(
    vaultPubKey: string,
    password: string
  ): Promise<VaultMeta> {
    const vault = await this.deps.getVault(vaultPubKey)
    return this.buildVaultMetaFromData(vault, password)
  }

  buildVaultMetaFromData(vault: VaultData, password: string): VaultMeta {
    return {
      password,
      localPartyId: vault.localPartyId,
      publicKeyEcdsa: vault.publicKeyEcdsa,
      publicKeyEddsa: vault.publicKeyEddsa,
      hexChainCode: vault.hexChainCode,
      resharePrefix: vault.resharePrefix,
      libType: vault.libType,
      signers: vault.signers,
      keyShares: vault.keyShares.map(ks => ({
        publicKey: ks.publicKey,
        keyShare: ks.keyShare,
      })),
    }
  }

  async getVault(vaultPubKey: string): Promise<VaultData> {
    return this.deps.getVault(vaultPubKey)
  }

  async getVaultCoins(vaultPubKey: string): Promise<CoinData[]> {
    return this.deps.getVaultCoins(vaultPubKey)
  }

  private async fetchBalances(coins: CoinData[]): Promise<BalanceInfo[]> {
    const tasks = coins.map(async (coin): Promise<BalanceInfo | null> => {
      return withFallback(
        attempt(async () => {
          const id =
            !coin.isNativeToken && coin.contractAddress
              ? coin.contractAddress
              : undefined

          const raw = await getCoinBalance({
            chain: coin.chain as Chain,
            address: coin.address,
            id,
          })

          return {
            chain: coin.chain,
            asset: coin.contractAddress ?? coin.ticker,
            symbol: coin.ticker,
            amount: formatBalance(raw, coin.decimals),
            decimals: coin.decimals,
          }
        }),
        null
      )
    })

    const results = await Promise.all(tasks)
    return results.filter((b): b is BalanceInfo => b !== null)
  }
}
