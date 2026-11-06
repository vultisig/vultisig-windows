import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'

import { getThorchainSecuredAssetSourceChain } from './getThorchainSecuredAssetSourceChain'

type SecuredAssetSourceChainLabelProps = ValueProp<CoinKey> & {
  size: number
}

/**
 * Names the source chain under a THORChain secured asset's ticker, so the
 * secured USDCs from Ethereum, Avalanche, Base and BSC read apart. Renders
 * nothing for every other coin.
 */
export const SecuredAssetSourceChainLabel = ({
  value,
  size,
}: SecuredAssetSourceChainLabelProps) => {
  const sourceChain = getThorchainSecuredAssetSourceChain(value)
  if (!sourceChain) return null

  return (
    <Text size={size} weight={500} color="shy" cropped>
      {getChainDisplayName(sourceChain)}
    </Text>
  )
}
