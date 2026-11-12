import { feeSettingsChains } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'

import { useSendValidationQuery } from '../queries/useSendValidationQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { SendAmountFeeEstimate } from './SendAmountFeeEstimate'
import { SendAmountFeeRowLayout } from './SendAmountFeeRowLayout'
import { SendFeeSkeleton } from './SendFeeSkeleton'

/**
 * The amount step's network fee. The payload it is read from is only built
 * once the address and amount pass validation; until then the row holds a
 * skeleton.
 */
export const SendAmountFeeRow = () => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()
  const { data } = useSendValidationQuery()
  const feeSettingsChain = isOneOf(coin.chain, feeSettingsChains)
    ? coin.chain
    : null

  if (amount === null || data === undefined || !isRecordEmpty(data)) {
    return (
      <SendAmountFeeRowLayout
        value={<SendFeeSkeleton />}
        hasSettings={feeSettingsChain !== null}
      />
    )
  }

  return <SendAmountFeeEstimate feeSettingsChain={feeSettingsChain} />
}
