import { getRippleAccountInfo } from '@core/chain/chains/ripple/account/info'

import { KeysignTxDataResolver } from '../resolver'

export const getRippleTxData: KeysignTxDataResolver<'ripple'> = async ({
  coin,
}) => {
  const rippleAccount = await getRippleAccountInfo(coin.address)
  return {
    sequence: BigInt(rippleAccount.account_data.Sequence),
    lastLedgerSequence: BigInt((rippleAccount.ledger_current_index ?? 0) + 60),
  } as any
}
