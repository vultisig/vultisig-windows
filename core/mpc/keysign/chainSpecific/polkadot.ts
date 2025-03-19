import { create } from '@bufbuild/protobuf'
import { getPolkadotClient } from '@core/chain/chains/polkadot/client'
import {
  PolkadotSpecific,
  PolkadotSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from './ChainSpecificResolver'

export const getPolkadotSpecific: ChainSpecificResolver<
  PolkadotSpecific
> = async ({ coin }) => {
  const client = await getPolkadotClient()
  const recentBlockHash = (await client.rpc.chain.getBlockHash()).toHex()
  const nonce = (
    await client.rpc.system.accountNextIndex(coin.address)
  ).toBigInt()
  const header = await client.rpc.chain.getHeader()
  const currentBlockNumber = header.number.toNumber()
  const genesisHash = (await client.rpc.chain.getBlockHash(0)).toHex()

  const { specVersion, transactionVersion } =
    await client.rpc.state.getRuntimeVersion()

  return create(PolkadotSpecificSchema, {
    recentBlockHash,
    nonce,
    currentBlockNumber: currentBlockNumber.toString(),
    specVersion: specVersion.toNumber(),
    transactionVersion: transactionVersion.toNumber(),
    genesisHash,
  })
}
