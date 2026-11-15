import { callPopup } from '@core/inpage-provider/popup'
import { UtxoChain } from '@vultisig/core-chain/Chain'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'

import { requestAccount } from '../core/requestAccount'

type SignBitcoinMessageInput = {
  chain: UtxoChain
  message: unknown
  type?: unknown
}

/**
 * Signs a UTF-8 text message with the connected Bitcoin account and returns
 * the base64 BIP-137 compact signature. Every argument comes from the page,
 * so unsupported chains, schemes and non-string messages are refused before
 * the account is requested or the popup opens.
 */
export const signBitcoinMessage = async ({
  chain,
  message,
  type = 'ecdsa',
}: SignBitcoinMessageInput): Promise<string> => {
  if (chain !== UtxoChain.Bitcoin) {
    throw new NotImplementedError(
      'Message signing is only supported for Bitcoin'
    )
  }
  if (typeof message !== 'string') {
    throw new Error('Bitcoin signMessage requires a string message')
  }
  if (type !== 'ecdsa' && type !== 'bip137') {
    throw new NotImplementedError(
      `Bitcoin message signature type ${String(type)}`
    )
  }

  const { address } = await requestAccount(chain)
  const signature = await callPopup(
    { signMessage: { sign_message: { chain, message } } },
    { account: address }
  )

  if (!/^[0-9a-f]{130}$/i.test(signature)) {
    throw new Error('Invalid Bitcoin message signature')
  }
  const bytes = Buffer.from(signature, 'hex')
  // The connected account is native SegWit (P2WPKH): BIP-137 headers 39–42.
  if (bytes[0] < 39 || bytes[0] > 42) {
    throw new Error('Invalid Bitcoin message signature header')
  }
  return bytes.toString('base64')
}
