import { create } from '@bufbuild/protobuf'
import { UtxoInfoSchema } from '@core/mpc/types/vultisig/keysign/v1/utxo_info_pb'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { cardanoApiUrl } from '../client/config'

type CardanoAsset = {
  policy_id: string
  asset_name: string // hex
  quantity: string
}

type CardanoUtxoResponse = Array<{
  tx_hash: string
  tx_index: number
  value: string
  asset_list?: CardanoAsset[]
}>

export const getCardanoUtxos = async (address: string) => {
  const url = `${cardanoApiUrl}/address_utxos`

  const utxos = await queryUrl<CardanoUtxoResponse>(url, {
    body: {
      _addresses: [address],
    },
  })

  return utxos.map(({ tx_hash, tx_index, value }) =>
    create(UtxoInfoSchema, {
      hash: tx_hash,
      amount: BigInt(value),
      index: tx_index,
    })
  )
}
