import { getRippleAccountInfo } from '@core/chain/chains/ripple/account/info'

import { KeysignTxDataResolver } from '../resolver'

export const getRippleTxData: KeysignTxDataResolver<'ripple'> = async ({
  coin: { address },
}) => {
  const { account_data, ledger_current_index } =
    await getRippleAccountInfo(address)

  return {
    sequence: BigInt(account_data.Sequence),
    lastLedgerSequence: BigInt((ledger_current_index ?? 0) + 60),
  }
}
