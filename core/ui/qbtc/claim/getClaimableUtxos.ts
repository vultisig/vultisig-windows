import { Chain } from '@vultisig/core-chain/Chain'
import { getUtxoAddressInfo } from '@vultisig/core-chain/chains/utxo/client/getUtxoAddressInfo'

import { ClaimableUtxo } from './types'

type GetClaimableUtxosInput = {
  btcAddress: string
}

/**
 * Fetches Bitcoin UTXOs for the given address via Blockchair and returns them
 * as claimable candidates on the QBTC chain.
 *
 * Note: this does not cross-check with the QBTC chain to filter
 * already-claimed UTXOs — see btcq-org/qbtc#134.
 */
export const getClaimableUtxos = async ({
  btcAddress,
}: GetClaimableUtxosInput): Promise<ClaimableUtxo[]> => {
  const response = await getUtxoAddressInfo({
    address: btcAddress,
    chain: Chain.Bitcoin,
  })

  const { utxo } = response.data[btcAddress]

  return utxo.map(({ transaction_hash, index, value }) => ({
    txid: transaction_hash,
    vout: index,
    amount: value,
  }))
}
