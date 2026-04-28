import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { Address } from '@ton/core'
import { Chain } from '@vultisig/core-chain/Chain'
import { tonAddressToRaw } from '@vultisig/core-chain/chains/ton/address'
import {
  decodeTonMessageBody,
  tonPayloadToBase64,
} from '@vultisig/core-chain/chains/ton/messageBody/decode'
import type {
  TonMessageBodyIntent,
  TonSwapIntent,
} from '@vultisig/core-chain/chains/ton/messageBody/types'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { knownTokensIndex } from '@vultisig/core-chain/coin/knownTokens'
import { rootApiUrl } from '@vultisig/core-config'
import { TonMessage } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

export type DecodedTonMessage = {
  message: TonMessage
  intent: TonMessageBodyIntent | null
  swapIntent: TonSwapIntent | null
  swapOutputCoin: Coin | null
  /**
   * Coin matching the jetton wallet in `message.to` for jetton transfers and
   * jetton-backed swaps. Resolution does not require the token to be enabled in
   * the vault; enabled custom tokens are only used as a fallback when the token
   * is not in the known-token registry.
   */
  jettonCoin: Coin | null
}

/**
 * `Address.toString()` defaults to URL-safe + bounceable, which gives the
 * canonical mainnet user-friendly form (`EQ...`). Apply to both sides of a
 * comparison so user-friendly/raw and bounceable/non-bounceable variants of
 * the same hash collapse to one key.
 */
const normalizeTonAddress = (raw?: string): string | null => {
  if (!raw) return null

  const result = attempt(() => Address.parse(raw).toString())
  return result.data ?? null
}

type JettonWalletByAddressResponse = {
  jetton_wallets: Array<{
    address: string
    jetton: string
  }>
  address_book: Record<string, { user_friendly: string }>
}

type JettonMastersResponse = {
  jetton_masters: Array<{
    address: string
    jetton_content?: Record<string, unknown>
  }>
  address_book?: Record<string, { user_friendly: string }>
  metadata?: Record<string, unknown>
}

const getJettonMasterAddressByWalletAddress = async (
  walletAddress: string
): Promise<string> => {
  const rawAddress = tonAddressToRaw(walletAddress)
  const response = await queryUrl<JettonWalletByAddressResponse>(
    `${rootApiUrl}/ton/v3/jetton/wallets?address=${rawAddress}`
  )

  const masterAddress = response.jetton_wallets[0]?.jetton
  if (!masterAddress) throw new Error('No jetton master found')

  return response.address_book[masterAddress]?.user_friendly ?? masterAddress
}

const isObjectRecord = (value: unknown): value is object =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const findStringValue = (
  value: unknown,
  keys: string[],
  depth = 0
): string | null => {
  if (depth > 3) return null

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findStringValue(item, keys, depth + 1)
      if (result) return result
    }

    return null
  }

  if (!isObjectRecord(value)) return null

  const entries = Object.entries(value)
  for (const key of keys) {
    const candidate = entries.find(([entryKey]) => entryKey === key)?.[1]
    if (typeof candidate === 'string' && candidate.trim()) return candidate
    if (typeof candidate === 'number') return candidate.toString()
  }

  for (const [, candidate] of entries) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const result = findStringValue(item, keys, depth + 1)
        if (result) return result
      }
    } else {
      const result = findStringValue(candidate, keys, depth + 1)
      if (result) return result
    }
  }

  return null
}

const getTonJettonMetadataSources = (response: JettonMastersResponse) => {
  const master = response.jetton_masters[0]
  if (!master) return []

  const metadataValues = Object.values(response.metadata ?? {})

  return [master.jetton_content, ...metadataValues]
}

const getTonJettonCoinByMasterAddress = async (
  masterAddress: string
): Promise<Coin | null> => {
  const rawAddress = tonAddressToRaw(masterAddress)
  const response = await queryUrl<JettonMastersResponse>(
    `${rootApiUrl}/ton/v3/jetton/masters?address=${rawAddress}`
  )

  const master = response.jetton_masters[0]
  if (!master) return null

  const sources = getTonJettonMetadataSources(response)
  const ticker = findStringValue(sources, ['symbol', 'ticker'])
  if (!ticker) return null

  const decimalsValue = findStringValue(sources, ['decimals'])
  const decimals = decimalsValue ? Number.parseInt(decimalsValue, 10) : 9
  const normalizedAddress =
    normalizeTonAddress(
      response.address_book?.[master.address]?.user_friendly
    ) ??
    normalizeTonAddress(master.address) ??
    masterAddress

  return {
    chain: Chain.Ton,
    id: normalizedAddress,
    ticker,
    decimals: Number.isFinite(decimals) ? decimals : 9,
    logo: findStringValue(sources, ['image', 'image_data']) ?? undefined,
  }
}

type UseTonMessageDecodeInput = {
  tonMessages: TonMessage[]
}

type TonTokenCoin = Coin & { id: string }

const isTonTokenCoin = (
  coin: AccountCoin
): coin is AccountCoin & { id: string } => coin.chain === Chain.Ton && !!coin.id

const getKnownTonCoin = (address: string): Coin | null =>
  knownTokensIndex[Chain.Ton]?.[address.toLowerCase()] ?? null

const getVaultTonCoin = ({
  address,
  tonTokens,
}: {
  address: string
  tonTokens: TonTokenCoin[]
}): Coin | null =>
  tonTokens.find(coin => normalizeTonAddress(coin.id) === address) ?? null

const getTonCoinByJettonWalletAddress = async ({
  walletAddress,
  tonTokens,
}: {
  walletAddress: string
  tonTokens: TonTokenCoin[]
}): Promise<Coin | null> => {
  const masterAddress = normalizeTonAddress(
    await getJettonMasterAddressByWalletAddress(walletAddress)
  )
  if (!masterAddress) return null

  return (
    getKnownTonCoin(masterAddress) ??
    getVaultTonCoin({ address: masterAddress, tonTokens }) ??
    (await getTonJettonCoinByMasterAddress(masterAddress))
  )
}

const uniqueSorted = (values: string[]) => [...new Set(values)].sort()

/**
 * Decodes the BOC body of each `TonMessage` and resolves TON jetton wallets
 * involved in transfers/swaps to coin metadata.
 *
 * Resolution is best-effort and does not require tokens to be enabled in the
 * vault. Known TON tokens resolve from the SDK registry; enabled vault tokens
 * are used only for custom-token metadata fallback.
 */
export const useTonMessageDecode = ({
  tonMessages,
}: UseTonMessageDecodeInput): {
  decoded: DecodedTonMessage[]
  isResolvingJettons: boolean
} => {
  const vaultCoins = useCurrentVaultCoins()

  const tonTokens = vaultCoins.filter(isTonTokenCoin)
  const tonTokenIds = tonTokens.map(coin => coin.id).sort()

  const decodedMessages = tonMessages.map(message => ({
    message,
    intent: decodeTonMessageBody(tonPayloadToBase64(message.payload)),
  }))

  const inputJettonWalletAddresses = decodedMessages
    .map(({ message, intent }) => {
      const isJettonInput =
        intent?.kind === 'jettonTransfer' ||
        (intent?.kind === 'swap' && intent.offerAsset === 'jetton')

      if (!isJettonInput) return null

      return normalizeTonAddress(message.to)
    })
    .filter((address): address is string => !!address)

  const swapTargetAddresses = decodedMessages
    .map(({ intent }) => {
      if (intent?.kind !== 'swap' || !intent.targetAddress) return null

      return normalizeTonAddress(intent.targetAddress)
    })
    .filter((address): address is string => !!address)

  const jettonWalletAddresses = uniqueSorted([
    ...inputJettonWalletAddresses,
    ...swapTargetAddresses,
  ])

  const jettonCoinMapQuery = useQuery({
    queryKey: ['tonJettonCoinMap', jettonWalletAddresses, tonTokenIds],
    queryFn: async (): Promise<Map<string, Coin>> => {
      const map = new Map<string, Coin>()

      await Promise.all(
        jettonWalletAddresses.map(async walletAddress => {
          const result = await attempt(() =>
            getTonCoinByJettonWalletAddress({
              walletAddress,
              tonTokens,
            })
          )
          if ('error' in result || !result.data) return

          map.set(walletAddress, result.data)
        })
      )

      return map
    },
    enabled: jettonWalletAddresses.length > 0,
    staleTime: Infinity,
    retry: false,
  })

  const jettonCoinMap = jettonCoinMapQuery.data

  const decoded: DecodedTonMessage[] = decodedMessages.map(
    ({ message, intent }) => {
      const swapIntent = intent?.kind === 'swap' ? intent : null
      const swapTargetAddress = swapIntent?.targetAddress
        ? normalizeTonAddress(swapIntent.targetAddress)
        : null
      const swapOutputCoin = swapTargetAddress
        ? (jettonCoinMap?.get(swapTargetAddress) ?? null)
        : null
      const shouldResolveJettonCoin =
        intent?.kind === 'jettonTransfer' || swapIntent?.offerAsset === 'jetton'

      if (!shouldResolveJettonCoin) {
        return { message, intent, swapIntent, swapOutputCoin, jettonCoin: null }
      }

      const normalized = normalizeTonAddress(message.to)
      const jettonCoin = normalized
        ? (jettonCoinMap?.get(normalized) ?? null)
        : null

      return { message, intent, swapIntent, swapOutputCoin, jettonCoin }
    }
  )

  return {
    decoded,
    isResolvingJettons:
      jettonCoinMapQuery.isPending && jettonWalletAddresses.length > 0,
  }
}
