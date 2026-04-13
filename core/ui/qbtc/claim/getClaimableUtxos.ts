import { qbtcRestUrl } from '@vultisig/core-chain/chains/cosmos/qbtc/tendermintRpcUrl'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { QbtcUtxo, QbtcUtxosResponse } from './types'

type GetClaimableUtxosInput = {
  btcAddress: string
}

/** Fetches claimable UTXOs from the QBTC chain for the given Bitcoin address. */
export const getClaimableUtxos = async ({
  btcAddress,
}: GetClaimableUtxosInput): Promise<QbtcUtxo[]> => {
  const url = `${qbtcRestUrl}/qbtc/v1/utxos/${btcAddress}`

  const { utxos } = await queryUrl<QbtcUtxosResponse>(url)

  return utxos.filter(utxo => BigInt(utxo.entitled_amount) > 0n)
}
