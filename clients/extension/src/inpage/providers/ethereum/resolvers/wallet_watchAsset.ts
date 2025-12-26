import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { isHex } from 'viem'

import { getChain } from '../utils'

type WatchAssetOptions = {
  address: string
  symbol?: string
  decimals?: number
  image?: string
}

type WatchAssetInput = {
  type: string
  options: WatchAssetOptions
}

export const watchAsset = async ({
  type,
  options,
}: WatchAssetInput): Promise<boolean> => {
  if (type !== 'ERC20') {
    throw new Error('Asset type not supported')
  }

  const { address, image } = options

  if (!isHex(address)) {
    throw new Error('Invalid token address')
  }

  const chain = await getChain()

  const metadata = await callBackground({
    getTokenMetadata: { chain, id: address },
  })

  return callPopup({
    watchAsset: {
      chain,
      id: address,
      ticker: metadata.ticker,
      decimals: metadata.decimals,
      logo: image,
    },
  })
}
