import { UseFormGetValues, UseFormTrigger } from 'react-hook-form'

import { FormData } from '../DepositForm/types'

type RevalidateAmountOnBalanceChangeInput = {
  getValues: UseFormGetValues<FormData>
  trigger: UseFormTrigger<FormData>
}

/**
 * Re-runs amount validation after the selected coin or its balance changed, so
 * an amount that was valid against the previous max stops passing. Only the
 * amount is validated, and only once it holds a value — validating the whole
 * form here would mark every untouched required field as errored on mount
 * (#4546). Resolves once validation settled, or immediately when it was
 * skipped.
 */
export const revalidateAmountOnBalanceChange = ({
  getValues,
  trigger,
}: RevalidateAmountOnBalanceChangeInput) => {
  const amount = getValues('amount')
  if (amount === undefined || amount === null || amount === '') {
    return Promise.resolve()
  }

  return trigger('amount')
}
