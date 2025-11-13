import { create } from '@bufbuild/protobuf'
import { getPolkadotClient } from '@core/chain/chains/polkadot/client'
import { polkadotConfig } from '@core/chain/chains/polkadot/config'
import { PolkadotSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { attempt, withFallback } from '@lib/utils/attempt'

import { getKeysignAmount } from '../../utils/getKeysignAmount'
import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { resolvePolkadotToAddress } from '../../utils/resolvePolkadotToAddress'
import { GetChainSpecificResolver } from '../resolver'

export const getPolkadotChainSpecific: GetChainSpecificResolver<
  'polkadotSpecific'
> = async ({ keysignPayload, walletCore }) => {
  const coin = getKeysignCoin(keysignPayload)
  const toAddress = resolvePolkadotToAddress({
    keysignPayload,
    walletCore,
  })
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

  const transfer = client.tx.balances.transferKeepAlive(
    toAddress,
    getKeysignAmount(keysignPayload)
  )

  const gas = await withFallback(
    attempt(async () =>
      (
        await transfer.paymentInfo(coin.address, { nonce })
      ).partialFee.toBigInt()
    ),
    polkadotConfig.fee
  )

  return create(PolkadotSpecificSchema, {
    recentBlockHash,
    nonce,
    currentBlockNumber: currentBlockNumber.toString(),
    specVersion: specVersion.toNumber(),
    transactionVersion: transactionVersion.toNumber(),
    genesisHash,
    gas,
  })
}
