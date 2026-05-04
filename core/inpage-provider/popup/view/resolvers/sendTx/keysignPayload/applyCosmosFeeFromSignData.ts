import { fromBase64 } from '@cosmjs/encoding'
import { CosmosChain } from '@vultisig/core-chain/Chain'
import { sumFeeAmountForCosmosChainFeeDenom } from '@vultisig/core-chain/chains/cosmos/sumFeeAmountForCosmosChainFeeDenom'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { AuthInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

type FeeAmount = { denom: string; amount: string }

const getDappFeeAmounts = (
  signData: KeysignPayload['signData']
): readonly FeeAmount[] | undefined => {
  if (signData.case === 'signAmino') {
    return signData.value.fee?.amount
  }
  if (signData.case === 'signDirect') {
    const result = attempt(() =>
      AuthInfo.decode(fromBase64(signData.value.authInfoBytes))
    )
    if ('error' in result) return undefined
    return result.data.fee?.amount
  }
  return undefined
}

type ApplyCosmosFeeFromSignDataInput = {
  keysignPayload: KeysignPayload
  chain: CosmosChain
}

/**
 * Copies the dapp-supplied fee from `signData` (signAmino or signDirect) into
 * `blockchainSpecific.thorchainSpecific.fee` / `cosmosSpecific.gas`, so the
 * Network Fee row on the keysign popup — and any other consumer of
 * `blockchainSpecific` — reads the same value the chain will actually charge.
 *
 * No-op when:
 *   - the chain isn't cosmos-routed (caller guards on `isChainOfKind('cosmos')`)
 *   - no dapp signData is present (e.g., native sends Vultisig built itself)
 *   - the dapp paid in a non-native fee denom (we can't collapse a multi-denom
 *     fee into the proto's single `uint64`; leaves the estimate in place)
 *   - `blockchainSpecific.case` is `mayachainSpecific` (no `fee` field on that
 *     schema — safe to skip; MAYA uses a hardcoded fallback elsewhere)
 */
export const applyCosmosFeeFromSignData = ({
  keysignPayload,
  chain,
}: ApplyCosmosFeeFromSignDataInput): void => {
  const feeAmounts = getDappFeeAmounts(keysignPayload.signData)
  if (!feeAmounts) return

  const fee = sumFeeAmountForCosmosChainFeeDenom({ amounts: feeAmounts, chain })
  if (fee === null) return

  const { blockchainSpecific } = keysignPayload
  if (blockchainSpecific.case === 'thorchainSpecific') {
    blockchainSpecific.value.fee = fee
  } else if (blockchainSpecific.case === 'cosmosSpecific') {
    blockchainSpecific.value.gas = fee
  }
}
