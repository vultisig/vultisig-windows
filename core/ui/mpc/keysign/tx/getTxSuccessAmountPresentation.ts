import { TxActionLabelKey } from './TxOverviewAmount'

type GetTxSuccessAmountPresentationInput = {
  amount: number
  amountOverride?: string
  skipBroadcast?: boolean
  txActionLabel?: TxActionLabelKey
}

export const getTxSuccessAmountPresentation = ({
  amount,
  amountOverride,
  skipBroadcast,
  txActionLabel,
}: GetTxSuccessAmountPresentationInput) => {
  const hideZeroAmount = !!skipBroadcast && !amountOverride && amount === 0

  return {
    actionLabel: hideZeroAmount ? 'signed_signature' : txActionLabel,
    hideZeroAmount,
  } satisfies {
    actionLabel?: TxActionLabelKey
    hideZeroAmount: boolean
  }
}
