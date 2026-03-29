import { create } from '@bufbuild/protobuf'
import { UtxoChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import { UtxoInfoSchema } from '@core/mpc/types/vultisig/keysign/v1/utxo_info_pb'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { minUtxo } from '../minUtxo'

type DashAddressUtxo = {
  address: string
  txid: string
  outputIndex: number
  script: string
  satoshis: number
  height: number
}

type DashRpcResponse = {
  result: DashAddressUtxo[] | null
  error: { code: number; message: string } | null
  id: string
}

export const getDashUtxos = async (address: string) => {
  const response = await queryUrl<DashRpcResponse>(`${rootApiUrl}/dash/`, {
    body: {
      jsonrpc: '1.0',
      id: 'vultisig',
      method: 'getaddressutxos',
      params: [{ addresses: [address] }],
    },
  })

  if (response.error || !response.result) {
    return []
  }

  return response.result
    .filter(({ satoshis }) => satoshis > minUtxo[UtxoChain.Dash])
    .map(({ txid, satoshis, outputIndex }) =>
      create(UtxoInfoSchema, {
        hash: txid,
        amount: BigInt(satoshis),
        index: outputIndex,
      })
    )
}
