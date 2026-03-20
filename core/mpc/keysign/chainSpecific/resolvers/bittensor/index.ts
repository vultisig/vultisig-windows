import { create } from '@bufbuild/protobuf'
import { bittensorRpcUrl } from '@core/chain/chains/bittensor/client'
import { bittensorConfig } from '@core/chain/chains/bittensor/config'
import { PolkadotSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { attempt, withFallback } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../../resolver'
import { refineBittensorChainSpecific } from './refine'

type RpcResponse<T> = { jsonrpc: string; id: number; result: T }

const rpc = async <T>(method: string, params: unknown[] = []) => {
  const { result } = await queryUrl<RpcResponse<T>>(bittensorRpcUrl, {
    body: { jsonrpc: '2.0', method, params, id: 1 },
  })
  return result
}

export const getBittensorChainSpecific: GetChainSpecificResolver<
  'polkadotSpecific'
> = async ({ keysignPayload }) => {
  const { address } = getKeysignCoin(keysignPayload)

  const [runtimeVersion, blockHash, nonce, header, genesisHash] =
    await Promise.all([
      rpc<{ specVersion: number; transactionVersion: number }>(
        'state_getRuntimeVersion'
      ),
      rpc<string>('chain_getBlockHash'),
      rpc<number>('system_accountNextIndex', [address]),
      rpc<{ number: string }>('chain_getHeader'),
      rpc<string>('chain_getBlockHash', [0]),
    ])

  const chainSpecific = create(PolkadotSpecificSchema, {
    recentBlockHash: blockHash,
    nonce: BigInt(nonce),
    currentBlockNumber: String(parseInt(header.number, 16)),
    specVersion: runtimeVersion.specVersion,
    transactionVersion: runtimeVersion.transactionVersion,
    genesisHash,
    gas: bittensorConfig.fee,
  })

  return withFallback(
    attempt(
      refineBittensorChainSpecific({
        keysignPayload,
        chainSpecific,
      })
    ),
    chainSpecific
  )
}
