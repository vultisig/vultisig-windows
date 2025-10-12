import { getPolkadotClient } from '@core/chain/chains/polkadot/client'

import { KeysignTxDataResolver } from '../resolver'

export const getPolkadotTxData: KeysignTxDataResolver<'polkadot'> = async ({
  coin,
}) => {
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

  return {
    recentBlockHash,
    nonce,
    currentBlockNumber: currentBlockNumber.toString(),
    specVersion: specVersion.toNumber(),
    transactionVersion: transactionVersion.toNumber(),
    genesisHash,
  }
}
