import { CosmosChain } from '@vultisig/core-chain/Chain'
import { sumFeeAmountForCosmosChainFeeDenom } from '@vultisig/core-chain/chains/cosmos/sumFeeAmountForCosmosChainFeeDenom'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import {
  getDappCosmosFeeAmounts,
  isExecuteContractSignData,
} from './dappCosmosFee'

type ApplyCosmosFeeFromSignDataInput = {
  keysignPayload: KeysignPayload
  chain: CosmosChain
}

/**
 * Reconciles the dapp-supplied fee from `signData` (signAmino or signDirect)
 * with the chain-default fee already in `blockchainSpecific`, writing the
 * resulting estimate to `thorchainSpecific.fee` / `cosmosSpecific.gas` so the
 * Network Fee row on the keysign popup matches what the user will actually pay.
 *
 * Reconciliation rule:
 *   - `MsgExecuteContract` (any cosmos chain): use signed. Contract calls pay
 *     exactly what's in `fee.amount` (gas × gas_price the dapp simulated).
 *   - Non-contract on vaultBased chains (THORChain): keep the chain-default
 *     already in `thorchainSpecific.fee`. THORChain ignores `fee.amount` and
 *     deducts a flat `NativeTransactionFee` (currently 0.02 RUNE); whatever
 *     the dapp signed is decorative.
 *   - Non-contract on ibcEnabled chains (Osmosis, Cosmos Hub, etc.): use
 *     signed. The chain deducts exactly `fee.amount`.
 *
 * No-op when:
 *   - the chain isn't cosmos-routed (caller guards on `isChainOfKind('cosmos')`)
 *   - no dapp signData is present (e.g., native sends Vultisig built itself)
 *   - the dapp paid only in non-native fee denoms. This function can't collapse
 *     those into the proto's single `uint64`; the display layer shows them raw.
 *   - `blockchainSpecific.case` is `mayachainSpecific` (no `fee` field on that
 *     schema — safe to skip; MAYA uses a hardcoded fallback elsewhere)
 */
export const applyCosmosFeeFromSignData = ({
  keysignPayload,
  chain,
}: ApplyCosmosFeeFromSignDataInput): void => {
  const feeAmounts = getDappCosmosFeeAmounts(keysignPayload.signData)
  if (!feeAmounts) return

  const signedFee = sumFeeAmountForCosmosChainFeeDenom({
    amounts: feeAmounts,
    chain,
  })
  if (signedFee === null) return

  const { blockchainSpecific } = keysignPayload
  const isExecuteContract = isExecuteContractSignData(keysignPayload.signData)

  if (blockchainSpecific.case === 'thorchainSpecific') {
    if (isExecuteContract) {
      blockchainSpecific.value.fee = signedFee
    }
    return
  }

  if (blockchainSpecific.case === 'cosmosSpecific') {
    blockchainSpecific.value.gas = signedFee
  }
}
