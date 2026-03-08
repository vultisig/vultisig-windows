import { Chain } from '@core/chain/Chain'
import { getUtxoAddressInfo } from '@core/chain/chains/utxo/client/getUtxoAddressInfo'

type ShieldingUtxo = {
  txHash: string
  index: number
  value: number
  scriptHex: string
}

export const getShieldingUtxos = async (
  address: string
): Promise<ShieldingUtxo[]> => {
  const { data } = await getUtxoAddressInfo({
    chain: Chain.Zcash,
    address,
  })

  return data[address].utxo
    .filter(u => u.is_spendable && u.value > 0)
    .map(u => ({
      txHash: u.transaction_hash,
      index: u.index,
      value: u.value,
      scriptHex: u.script_hex,
    }))
}
