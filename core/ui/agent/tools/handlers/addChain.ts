import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'

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

  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const address = deriveAddress({ chain, publicKey, walletCore })
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
