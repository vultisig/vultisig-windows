import { getSolanaToken } from '@core/chain/coin/find/solana/getSolanaToken'

import { CustomTokenResolver } from './CustomTokenResolver'

export const getSolanaCustomToken: CustomTokenResolver = async ({
  address,
}) => {
  return getSolanaToken(address)
}
