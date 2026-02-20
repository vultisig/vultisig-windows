import type { AddressBookEntry, BackendCoinInfo, MessageContext } from './types'

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
  addressBookItems?: AddressBookData[]
}

export function buildMessageContext(deps: ContextDeps): MessageContext {
  const addresses: Record<string, string> = {}
  for (const coin of deps.coins) {
    if (coin.isNativeToken && coin.address) {
      if (!addresses[coin.chain]) {
        addresses[coin.chain] = coin.address
      }
    }
  }

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

  return ctx
}
