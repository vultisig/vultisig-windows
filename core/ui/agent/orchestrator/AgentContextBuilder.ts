import { getAgentInstructions } from '../config'
import type {
  AddressBookEntry,
  AllVaultInfo,
  BackendCoinInfo,
  BalanceInfo,
  MessageContext,
} from './types'

type CoinData = {
  chain: string
  ticker: string
  address: string
  contractAddress?: string
  isNativeToken: boolean
  decimals: number
}

type AddressBookData = {
  title: string
  address: string
  chain: string
}

type ContextDeps = {
  vaultPubKey: string
  vaultName: string
  coins: CoinData[]
  balances?: BalanceInfo[]
  addressBookItems?: AddressBookData[]
  allVaults?: Array<{
    name: string
    publicKeyEcdsa: string
    publicKeyEddsa: string
    coins: CoinData[]
  }>
}

function getNativeAddresses(coins: CoinData[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const coin of coins) {
    if (coin.isNativeToken && coin.address) {
      if (!result[coin.chain]) {
        result[coin.chain] = coin.address
      }
    }
  }
  return result
}

function mergeAddressBookEntries(
  entries: AddressBookEntry[]
): AddressBookEntry[] {
  const seen = new Set<string>()

  return entries.filter(entry => {
    const key = `${entry.title}::${entry.chain}::${entry.address}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function buildMessageContext(deps: ContextDeps): MessageContext {
  const addresses = getNativeAddresses(deps.coins)

  const coins: BackendCoinInfo[] = deps.coins.map(c => ({
    chain: c.chain,
    ticker: c.ticker,
    contract_address: c.contractAddress,
    is_native_token: c.isNativeToken,
    decimals: c.decimals,
  }))

  const ctx: MessageContext = {
    vault_address: deps.vaultPubKey,
    vault_name: deps.vaultName,
    balances: deps.balances,
    addresses,
    coins,
  }

  if (deps.addressBookItems && deps.addressBookItems.length > 0) {
    ctx.address_book = deps.addressBookItems.map<AddressBookEntry>(item => ({
      title: item.title,
      address: item.address,
      chain: item.chain,
    }))
  }

  if (deps.allVaults && deps.allVaults.length > 0) {
    ctx.all_vaults = deps.allVaults.map<AllVaultInfo>(vault => ({
      name: vault.name,
      pubkey_ecdsa: vault.publicKeyEcdsa,
      pubkey_eddsa: vault.publicKeyEddsa,
      addresses: getNativeAddresses(vault.coins),
    }))

    const internalVaultEntries = ctx.all_vaults.flatMap<AddressBookEntry>(
      vault =>
        Object.entries(vault.addresses).map(([chain, address]) => ({
          title: vault.name,
          chain,
          address,
        }))
    )

    if (internalVaultEntries.length > 0) {
      ctx.address_book = mergeAddressBookEntries([
        ...(ctx.address_book ?? []),
        ...internalVaultEntries,
      ])
    }
  }

  ctx.instructions = getAgentInstructions({
    allVaultsJson: ctx.all_vaults ? JSON.stringify(ctx.all_vaults) : undefined,
    addressBookJson: ctx.address_book
      ? JSON.stringify(ctx.address_book)
      : undefined,
  })

  return ctx
}
