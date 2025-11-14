import { create } from '@bufbuild/protobuf'
import { getPolkadotClient } from '@core/chain/chains/polkadot/client'
import { polkadotConfig } from '@core/chain/chains/polkadot/config'
import { PolkadotSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { attempt, withFallback } from '@lib/utils/attempt'

import { getKeysignCoin } from '../../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../../resolver'
import { refinePolkadotChainSpecific } from './refine'

export const getPolkadotChainSpecific: GetChainSpecificResolver<
  'polkadotSpecific'
> = async ({ keysignPayload, walletCore }) => {
  const client = await getPolkadotClient()

  const { address } = getKeysignCoin(keysignPayload)

  const { specVersion, transactionVersion } =
    await client.rpc.state.getRuntimeVersion()

  const chainSpecific = create(PolkadotSpecificSchema, {
    recentBlockHash: (await client.rpc.chain.getBlockHash()).toHex(),
    nonce: (await client.rpc.system.accountNextIndex(address)).toBigInt(),
    currentBlockNumber: (await client.rpc.chain.getHeader()).number.toString(),
    specVersion: specVersion.toNumber(),
    transactionVersion: transactionVersion.toNumber(),
    genesisHash: (await client.rpc.chain.getBlockHash(0)).toHex(),
    gas: polkadotConfig.fee,
  })

  return withFallback(
    attempt(
      refinePolkadotChainSpecific({
        keysignPayload,
        chainSpecific,
        walletCore,
      })
    ),
    chainSpecific
  )
}
