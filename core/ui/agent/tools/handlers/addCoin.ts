import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { knownTokensIndex } from '@core/chain/coin/knownTokens/index'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'

import { getChainFromString } from '../../utils/getChainFromString'
import { getWalletContext } from '../shared/walletContext'
import type { ToolHandler } from '../types'

export const handleAddCoin: ToolHandler = async (input, context) => {
  const store = window.go?.storage?.Store
  if (!store) throw new Error('storage not available')

  const chainInput = String(input.chain ?? '').trim()
  if (!chainInput) throw new Error('chain is required')

  const tickerRaw = String(input.ticker ?? input.symbol ?? '').trim()
  if (!tickerRaw) throw new Error('ticker is required')
  const ticker = tickerRaw.toUpperCase()

  const chain = getChainFromString(chainInput)
  if (!chain) {
    const supported = Object.values(Chain).join(', ')
    throw new Error(
      `Unsupported chain '${chainInput}'. Supported chains: ${supported}`
    )
  }

  let contractAddress = ''
  if (input.contract_address) {
    contractAddress = String(input.contract_address).trim()
  }

  const feeCoin = chainFeeCoin[chain]

  if (!contractAddress && ticker.toUpperCase() !== feeCoin.ticker.toUpperCase()) {
    const tokens = knownTokensIndex[chain]
    if (tokens) {
      const match = Object.entries(tokens).find(
        ([, t]) => t.ticker.toUpperCase() === ticker.toUpperCase()
      )
      if (match) {
        contractAddress = match[0]
      }
    }
  }

  let isNative = contractAddress === ''
  if (input.is_native !== undefined) {
    isNative = Boolean(input.is_native)
  }

  let decimals = 18
  let logo = ''
  let priceProviderId = ''

  if (isNative) {
    decimals = feeCoin.decimals
    logo = feeCoin.logo
    priceProviderId = feeCoin.priceProviderId ?? ''
  } else if (contractAddress) {
    const tokens = knownTokensIndex[chain]
    if (tokens) {
      const known = tokens[contractAddress.toLowerCase()]
      if (known) {
        decimals = known.decimals
        logo = known.logo
        priceProviderId = known.priceProviderId ?? ''
      }
    }
  }

  if (input.decimals !== undefined) {
    decimals = Number(input.decimals)
  }
  if (input.logo) {
    logo = String(input.logo)
  }
  if (input.price_provider_id) {
    priceProviderId = String(input.price_provider_id)
  }

  let existingAddress = ''
  for (const coin of context.coins) {
    if (coin.chain.toLowerCase() === chain.toLowerCase()) {
      existingAddress = coin.address
      break
    }
  }

  if (!existingAddress) {
    const { walletCore, vault } = getWalletContext()

    const publicKey = getPublicKey({
      chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
      chainPublicKeys: vault.chainPublicKeys,
    })

    existingAddress = deriveAddress({ chain, publicKey, walletCore })

    const feeCoin = chainFeeCoin[chain]
    await store.SaveCoin(context.vaultPubKey, {
      id: '',
      chain,
      address: existingAddress,
      ticker: feeCoin.ticker,
      contract_address: '',
      is_native_token: true,
      decimals: feeCoin.decimals,
      logo: feeCoin.logo,
      price_provider_id: feeCoin.priceProviderId ?? '',
    })
  }

  const duplicate = context.coins.some(
    c =>
      c.chain.toLowerCase() === chain.toLowerCase() &&
      c.ticker.toLowerCase() === ticker.toLowerCase() &&
      (c.contractAddress ?? '').toLowerCase() === contractAddress.toLowerCase()
  )
  if (duplicate) {
    return {
      data: {
        success: false,
        message: `Coin ${ticker} on ${chain} already exists in vault`,
      },
    }
  }

  const coinId = await store.SaveCoin(context.vaultPubKey, {
    id: '',
    chain,
    address: existingAddress,
    ticker,
    contract_address: contractAddress,
    is_native_token: isNative,
    decimals,
    logo,
    price_provider_id: priceProviderId,
  })

  if (window.runtime) {
    window.runtime.EventsEmit('vault:coins-changed')
  }

  return {
    data: {
      success: true,
      coin_id: coinId,
      chain,
      ticker,
      address: existingAddress,
      contract_address: contractAddress,
      message: `Successfully added ${ticker} on ${chain} to vault`,
    },
    vaultModified: true,
  }
}
