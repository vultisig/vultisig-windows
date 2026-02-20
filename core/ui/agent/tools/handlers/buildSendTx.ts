import { toBinary } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { buildSendKeysignPayload } from '@core/mpc/keysign/send/build'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { resolveAccountCoin } from '../shared/resolveAccountCoin'
import { getWalletContext } from '../shared/walletContext'
import type { ToolHandler } from '../types'

export const handleBuildSendTx: ToolHandler = async (input, context) => {
  const chainStr = String(input.chain ?? '').trim()
  const symbol = String(input.symbol ?? '').trim()
  const address = String(input.address ?? '').trim()
  const amountStr = String(input.amount ?? '').trim()
  const memo = input.memo != null ? String(input.memo).trim() : undefined

  if (!chainStr || !symbol || !address || !amountStr) {
    throw new Error('chain, symbol, address, and amount are required')
  }

  const coin = resolveAccountCoin(context.coins, chainStr, symbol)
  if (!coin) {
    throw new Error(
      `Could not resolve coin ${symbol} on ${chainStr} from vault`
    )
  }

  const amount = toChainAmount(parseFloat(amountStr), coin.decimals)

  const { walletCore, vault } = getWalletContext()

  const publicKey = getPublicKey({
    chain: coin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const keysignPayload = await buildSendKeysignPayload({
    coin,
    receiver: address,
    amount,
    memo,
    vaultId: vault.publicKeyEcdsa,
    localPartyId: vault.localPartyId,
    publicKey,
    libType: vault.libType,
    walletCore,
  })

  const payloadBytes = toBinary(KeysignPayloadSchema, keysignPayload)
  const keysignPayloadB64 = btoa(String.fromCharCode(...payloadBytes))

  return {
    data: {
      keysign_payload: keysignPayloadB64,
      from_chain: coin.chain,
      from_symbol: coin.ticker,
      amount: amountStr,
      sender: coin.address,
      destination: address,
      tx_type: 'send',
    },
  }
}
