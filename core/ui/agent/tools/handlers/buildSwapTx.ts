import { toBinary } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { findSwapQuote } from '@core/chain/swap/quote/findSwapQuote'
import { buildSwapKeysignPayload } from '@core/mpc/keysign/swap/build'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { resolveAccountCoin } from '../shared/resolveAccountCoin'
import { getWalletContext } from '../shared/walletContext'
import type { ToolHandler } from '../types'

export const handleBuildSwapTx: ToolHandler = async (input, context) => {
  const fromChainStr = String(input.from_chain ?? '').trim()
  const fromSymbol = String(input.from_symbol ?? '').trim()
  const toChainStr = String(input.to_chain ?? '').trim()
  const toSymbol = String(input.to_symbol ?? '').trim()
  const amountStr = String(input.amount ?? '').trim()

  if (!fromChainStr || !fromSymbol || !toChainStr || !toSymbol || !amountStr) {
    throw new Error(
      'from_chain, from_symbol, to_chain, to_symbol, and amount are required'
    )
  }

  const fromCoin = resolveAccountCoin(context.coins, fromChainStr, fromSymbol)
  if (!fromCoin) {
    throw new Error(
      `Could not resolve source coin ${fromSymbol} on ${fromChainStr} from vault`
    )
  }

  const toCoin = resolveAccountCoin(context.coins, toChainStr, toSymbol)
  if (!toCoin) {
    throw new Error(
      `Could not resolve destination coin ${toSymbol} on ${toChainStr} from vault`
    )
  }

  const amount = toChainAmount(parseFloat(amountStr), fromCoin.decimals)

  const swapQuote = await findSwapQuote({ from: fromCoin, to: toCoin, amount })

  const { walletCore, vault } = getWalletContext()

  const fromPublicKey = getPublicKey({
    chain: fromCoin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const toPublicKey = getPublicKey({
    chain: toCoin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const keysignPayload = await buildSwapKeysignPayload({
    fromCoin,
    toCoin,
    amount: parseFloat(amountStr),
    swapQuote,
    vaultId: vault.publicKeyEcdsa,
    localPartyId: vault.localPartyId,
    fromPublicKey,
    toPublicKey,
    libType: vault.libType,
    walletCore,
  })

  const payloadBytes = toBinary(KeysignPayloadSchema, keysignPayload)
  const keysignPayloadB64 = Buffer.from(payloadBytes).toString('base64')

  let provider = 'unknown'
  let expectedOutput = '0'
  if ('general' in swapQuote.quote) {
    provider = swapQuote.quote.general.provider
    expectedOutput = swapQuote.quote.general.dstAmount
  } else if ('native' in swapQuote.quote) {
    provider = swapQuote.quote.native.swapChain
    expectedOutput = swapQuote.quote.native.expected_amount_out
  }

  const hasApproval = !!keysignPayload.erc20ApprovePayload

  const txDetails: Record<string, unknown> = {
    to_address: keysignPayload.toAddress,
    to_amount: keysignPayload.toAmount,
    memo: keysignPayload.memo,
  }

  const bs = keysignPayload.blockchainSpecific
  if (bs.case === 'ethereumSpecific') {
    txDetails.nonce = bs.value.nonce.toString()
    txDetails.gas_limit = bs.value.gasLimit
    txDetails.max_fee_per_gas_wei = bs.value.maxFeePerGasWei
    txDetails.priority_fee = bs.value.priorityFee
  }

  if (keysignPayload.erc20ApprovePayload) {
    txDetails.approval_amount = keysignPayload.erc20ApprovePayload.amount
    txDetails.approval_spender = keysignPayload.erc20ApprovePayload.spender
  }

  return {
    data: {
      provider,
      expected_output: expectedOutput,
      minimum_output: expectedOutput,
      needs_approval: hasApproval,
      keysign_payload: keysignPayloadB64,
      from_chain: fromCoin.chain,
      from_symbol: fromCoin.ticker,
      to_chain: toCoin.chain,
      to_symbol: toCoin.ticker,
      amount: amountStr,
      sender: fromCoin.address,
      destination: toCoin.address,
      tx_details: txDetails,
    },
  }
}
