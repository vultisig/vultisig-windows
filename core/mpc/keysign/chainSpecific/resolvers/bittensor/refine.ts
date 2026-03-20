import { bittensorRpcUrl } from '@core/chain/chains/bittensor/client'
import {
  assembleBittensorExtrinsic,
  buildBittensorSigningPayload,
} from '@core/chain/chains/bittensor/signing/buildExtrinsic'
import { PolkadotSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getKeysignCoin } from '../../../utils/getKeysignCoin'

type RefineBittensorChainSpecificInput = {
  keysignPayload: KeysignPayload
  chainSpecific: PolkadotSpecific
}

export const refineBittensorChainSpecific = async ({
  keysignPayload,
  chainSpecific,
}: RefineBittensorChainSpecificInput): Promise<PolkadotSpecific> => {
  const { address } = getKeysignCoin(keysignPayload)

  // Build a dummy extrinsic using the custom builder (includes CheckMetadataHash)
  const { callData, signedExtra } = buildBittensorSigningPayload({
    toAddress: keysignPayload.toAddress || address,
    amount: BigInt(keysignPayload.toAmount),
    nonce: Number(chainSpecific.nonce),
    blockNumber: Number(chainSpecific.currentBlockNumber),
    blockHash: chainSpecific.recentBlockHash,
    genesisHash: chainSpecific.genesisHash,
    specVersion: chainSpecific.specVersion,
    transactionVersion: chainSpecific.transactionVersion,
  })

  // Assemble with dummy signer and zero signature for fee estimation
  const dummySigner = new Uint8Array(32)
  const dummySignature = new Uint8Array(64)
  const dummyExtrinsic = assembleBittensorExtrinsic(
    dummySigner,
    dummySignature,
    callData,
    signedExtra
  )

  const hexWithPrefix = ensureHexPrefix(
    Buffer.from(dummyExtrinsic).toString('hex')
  )

  const { result } = await queryUrl<{
    result: { partialFee: string }
  }>(bittensorRpcUrl, {
    body: {
      jsonrpc: '2.0',
      method: 'payment_queryInfo',
      params: [hexWithPrefix],
      id: 1,
    },
  })

  return {
    ...chainSpecific,
    gas: BigInt(result.partialFee),
  }
}
