import { CosmosChain, OtherChain } from '@vultisig/core-chain/Chain'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { attempt } from '@vultisig/lib-utils/attempt'
import { BinaryWriter } from 'cosmjs-types/binary'
import { AuthInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { keplrAverageGasPrice, SupportedKeplrChain } from '../keplrChainInfo'

// Excludes QBTC (handled separately because its fee denom isn't in
// `cosmosFeeCoinDenom`) and narrows back down to CosmosChain so the
// `cosmosFeeCoinDenom` lookup type-checks.
type KeplrCosmosChain = Exclude<SupportedKeplrChain, OtherChain.QBTC> &
  CosmosChain

type InjectKeplrFeeIfMissingInput = {
  authInfoBytes: Uint8Array
  chain: KeplrCosmosChain
}

/**
 * If the dApp passed a SignDoc with an empty `fee.amount` (Osmosis, Quasar
 * and other cosmos-kit fronts routinely do this and rely on the wallet to
 * fill in the fee), compute a fee from `gasLimit * chain gas price` and
 * inject it into a fresh AuthInfo. Mirrors real Keplr's behavior when
 * `signOptions.preferNoSetFee` is falsy.
 *
 * Returns the input bytes unchanged when:
 *   - the dApp already provided a fee
 *   - the chain has no positive gas price (THORChain / MayaChain → flat fee
 *     handled elsewhere)
 *   - the AuthInfo can't be decoded or carries no usable `gasLimit`
 *
 * The caller is responsible for honoring `signOptions.preferNoSetFee` —
 * skip this call entirely when the dApp opted out.
 */
export const injectKeplrFeeIfMissing = ({
  authInfoBytes,
  chain,
}: InjectKeplrFeeIfMissingInput): Uint8Array => {
  const decoded = attempt(() => AuthInfo.decode(authInfoBytes))
  if ('error' in decoded || !decoded.data) return authInfoBytes
  const authInfo = decoded.data

  if (authInfo.fee?.amount?.length) return authInfoBytes

  const gasPrice = keplrAverageGasPrice[chain]
  if (!gasPrice || gasPrice <= 0) return authInfoBytes

  const gasLimitBigInt = authInfo.fee?.gasLimit
  if (!gasLimitBigInt || gasLimitBigInt <= 0n) return authInfoBytes

  // gasLimit can be very large; do the math in BigInt by scaling gasPrice to
  // an integer first. gasPrice is a floating-point chain config (e.g. 0.025
  // uosmo/gas) — multiply by 1e9 to retain enough precision, then divide
  // out, rounding up so the fee never falls below the chain's minimum.
  const scale = 1_000_000_000n
  const scaledPrice = BigInt(Math.ceil(gasPrice * Number(scale)))
  const feeAmountInt = (gasLimitBigInt * scaledPrice + scale - 1n) / scale

  const denom = cosmosFeeCoinDenom[chain]

  const newAuthInfo = AuthInfo.fromPartial({
    ...authInfo,
    fee: {
      ...authInfo.fee,
      amount: [{ denom, amount: feeAmountInt.toString() }],
    },
  })

  const writer = BinaryWriter.create()
  AuthInfo.encode(newAuthInfo, writer)
  return writer.finish()
}
