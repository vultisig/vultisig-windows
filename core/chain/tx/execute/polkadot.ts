import { getPolkadotClient } from '@core/chain/chains/polkadot/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { isInError } from '@lib/utils/error/isInError'
import { blake2b } from '@noble/hashes/blake2'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'

export const executePolkadotTx: ExecuteTxResolver = async ({
  walletCore,
  compiledTx,
  skipBroadcast,
}) => {
  const { errorMessage: polkadotErrorMessage, encoded } =
    TW.Polkadot.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(polkadotErrorMessage)

  const rawTx = walletCore.HexCoding.encode(encoded)
  const hashBytes = blake2b(encoded, { dkLen: 32 })
  const txHash = ensureHexPrefix(Buffer.from(hashBytes).toString('hex'))
  if (skipBroadcast) return { txHash }

  const rpcClient = await getPolkadotClient()

  try {
    const { hash } = await rpcClient.rpc.author.submitExtrinsic(rawTx)
    return { txHash: hash.toHex() }
  } catch (error) {
    if (isInError(error, 'Transaction is temporarily banned')) {
      const extrinsic = rpcClient.createType('Extrinsic', rawTx, {
        isSigned: true,
        version: 4,
      })
      return { txHash: extrinsic.hash.toHex() }
    }

    throw error
  }
}
