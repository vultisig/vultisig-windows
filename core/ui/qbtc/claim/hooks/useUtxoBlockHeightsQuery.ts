import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getUtxoAddressInfo } from '@vultisig/core-chain/chains/utxo/client/getUtxoAddressInfo'

type UseUtxoBlockHeightsQueryInput = {
  btcAddress: string
}

export const utxoKey = ({ txid, vout }: { txid: string; vout: number }) =>
  `${txid}:${vout}`

/** Returns a map of UTXO key (`txid:vout`) to the block height the UTXO was
 * confirmed at. Used to compute the "Confirmed · N blocks ago" subtitle on
 * the claim selection screen. `block_id === 0` means the UTXO is still in
 * the mempool. */
export const useUtxoBlockHeightsQuery = ({
  btcAddress,
}: UseUtxoBlockHeightsQueryInput) => {
  return useQuery({
    queryKey: ['bitcoinUtxoBlockHeights', btcAddress],
    queryFn: async () => {
      const response = await getUtxoAddressInfo({
        address: btcAddress,
        chain: Chain.Bitcoin,
      })
      const utxos = response.data[btcAddress]?.utxo ?? []
      return new Map(
        utxos.map(u => [
          utxoKey({ txid: u.transaction_hash, vout: u.index }),
          u.block_id,
        ])
      )
    },
    enabled: btcAddress.length > 0,
  })
}
