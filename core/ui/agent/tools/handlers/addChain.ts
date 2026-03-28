import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getChainAddress } from '@core/chain/publicKey/address/getChainAddress'

import { getChainFromString } from '../../utils/getChainFromString'
import { getStorageContext } from '../shared/storageContext'
import { getWalletContext } from '../shared/walletContext'
import type { ToolHandler } from '../types'

export const handleAddChain: ToolHandler = async (input, context) => {
  const storage = getStorageContext()

  const chainInput = String(input.chain ?? '').trim()
  if (!chainInput) throw new Error('chain is required')

  const chain = getChainFromString(chainInput)
  if (!chain) {
    const supported = Object.values(Chain).join(', ')
    throw new Error(
      `Unsupported chain '${chainInput}'. Supported chains: ${supported}`
    )
  }

  const hasChain = context.coins.some(
    c => c.chain.toLowerCase() === chain.toLowerCase() && c.isNativeToken
  )
  if (hasChain) {
    return {
      data: {
        success: false,
        message: `Chain ${chain} is already in the vault`,
      },
    }
  }

  const { walletCore, vault } = getWalletContext()

  const address = getChainAddress({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    publicKeyMldsa: vault.publicKeyMldsa,
    chainPublicKeys: vault.chainPublicKeys,
  })
  const feeCoin = chainFeeCoin[chain]

  await storage.createCoin({
    vaultId: context.vaultPubKey,
    coin: {
      chain,
      address,
      ticker: feeCoin.ticker,
      decimals: feeCoin.decimals,
      logo: feeCoin.logo,
      priceProviderId: feeCoin.priceProviderId,
    },
  })

  return {
    data: {
      success: true,
      chain,
      ticker: feeCoin.ticker,
      address,
      message: `Successfully added ${chain} chain to vault with address ${address}`,
    },
    vaultModified: true,
  }
}
