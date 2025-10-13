import { getTonAccountInfo } from '@core/chain/chains/ton/account/getTonAccountInfo'

import { KeysignTxDataResolver } from '../resolver'

export const getTonTxData: KeysignTxDataResolver<'ton'> = async ({ coin }) => {
  const { account_state } = await getTonAccountInfo(coin.address)
  const sequenceNumber = BigInt(account_state.seqno || 0)

  return {
    sequenceNumber,
    expireAt: BigInt(Math.floor(Date.now() / 1000) + 600),
    bounceable: false,
  }
}
