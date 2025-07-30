import { OtherChain } from '@core/chain/Chain'
import { getPolkadotClient } from '@core/chain/chains/polkadot/client'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executePolkadotTx: ExecuteTxResolver<
  OtherChain.Polkadot
> = async ({ walletCore, tx }) => {
  const rawTx = walletCore.HexCoding.encode(tx.encoded)
  const client = await getPolkadotClient()
  const txHash = client
    .createType('Extrinsic', rawTx, {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()

  return { txHash }
}
