import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getTokenMetadata as getChainTokenMetadata } from '@vultisig/core-chain/coin/token/metadata'

/**
 * Resolves a token's symbol and decimals for dApp requests such as
 * `wallet_watchAsset`.
 */
export const getTokenMetadata: BackgroundResolver<'getTokenMetadata'> = ({
  input,
}) => getChainTokenMetadata(input)
