import { getRippleClient } from '@core/chain/chains/ripple/client'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'
import { sha512 } from 'ethers'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeRippleTx: ExecuteTxResolver = async ({
  walletCore,
  compiledTx,
  skipBroadcast,
}) => {
  const { encoded, errorMessage } =
    TW.Ripple.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(errorMessage)

  const rawTx = stripHexPrefix(walletCore.HexCoding.encode(encoded))
  if (skipBroadcast) {
    const fullHash = sha512(encoded)
    const first256 = fullHash.slice(0, 32) // first 256 bits (32 bytes)
    return { txHash: Buffer.from(first256).toString('hex').toUpperCase() }
  }

  const rpcClient = await getRippleClient()

  const { result } = await rpcClient.request({
    command: 'submit',
    tx_blob: rawTx,
  })

  const { engine_result, engine_result_message, tx_json } = result

  if (engine_result && engine_result !== 'tesSUCCESS') {
    if (engine_result_message) {
      if (
        engine_result_message.toLowerCase() ===
          'this sequence number has already passed.' &&
        tx_json?.hash
      ) {
        return { txHash: tx_json.hash }
      }
      return { txHash: engine_result_message }
    }
  }

  return { txHash: shouldBeDefined(tx_json?.hash) }
}
