import type { CosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { BinaryWriter } from 'cosmjs-types/binary'
import { AuthInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

/**
 * Normalizes the fee denom in AuthInfo bytes (e.g. ATOM → uatom for Cosmos Hub)
 * so the payload is valid and can be shown correctly in the UI.
 * Call in the provider before building transactionDetails for signDirect.
 */
export const normalizeCosmosAuthInfoFee = (
  authInfoBytes: Uint8Array,
  chain: CosmosChain
): Uint8Array => {
  const authInfo = AuthInfo.decode(authInfoBytes)
  if (!authInfo.fee?.amount?.length) return authInfoBytes

  const chainFeeDenom = cosmosFeeCoinDenom[chain]
  const toChainFeeDenom = (denom: string): string =>
    chainFeeCoin[chain]?.ticker === denom ? chainFeeDenom : denom

  const normalizedAmounts = authInfo.fee.amount.map(c => ({
    denom: toChainFeeDenom(c.denom),
    amount: c.amount,
  }))

  const normalizedAuthInfo = AuthInfo.fromPartial({
    ...authInfo,
    fee: {
      ...authInfo.fee,
      amount: normalizedAmounts,
    },
  })

  const writer = BinaryWriter.create()
  AuthInfo.encode(normalizedAuthInfo, writer)
  return writer.finish()
}
