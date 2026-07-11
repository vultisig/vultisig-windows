import {
  useForgetSolanaMoveStakeDestinationsMutation,
  useSetSolanaMoveStakeDestinationMutation,
} from '@core/ui/storage/solanaMoveStakeDestinations'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { attempt } from '@vultisig/lib-utils/attempt'
import { FieldValues } from 'react-hook-form'

import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'
import { useDepositAction } from './providers/DepositActionProvider'
import { useDepositCoin } from './providers/DepositCoinProvider'
import { DepositDataProvider } from './state/data'

/**
 * Deposit flow: the action form, then the verify step that starts the keysign.
 * Solana move-stake also has to remember its destination validator across the
 * two steps of the move, which happen days apart (see `onSubmit`).
 */
export const DepositPage = () => {
  const [action] = useDepositAction()
  const [coin] = useDepositCoin()
  const { mutateAsync: rememberMoveDestination } =
    useSetSolanaMoveStakeDestinationMutation()
  const { mutateAsync: forgetMoveDestinations } =
    useForgetSolanaMoveStakeDestinationsMutation()

  // A Solana move deactivates the stake account now and re-delegates it only
  // after the ~1-epoch cooldown, so the destination picked on the Move step has
  // to outlive this flow (and the app session) to prefill Finish Move days
  // later. A plain unstake on the same account supersedes any move in flight.
  //
  // The write is awaited before the flow advances so the destination is durable
  // by the time the deactivation can be signed. A failed write must not strand
  // the user mid-move, though: the move itself is unaffected, and Finish Move
  // stays available on the cooled-down account — it just asks for the validator
  // again rather than prefilling it.
  const onSubmit = async (data: FieldValues) => {
    const { stakeAccount, validatorAddress } = data

    if (action === 'solana_move_stake') {
      await attempt(() =>
        rememberMoveDestination({
          stakeAccount,
          owner: coin.address,
          votePubkey: validatorAddress,
        })
      )
    }

    if (action === 'solana_unstake') {
      await attempt(() => forgetMoveDestinations([stakeAccount]))
    }
  }

  return (
    <ValueTransfer<FieldValues>
      from={({ onFinish }) => (
        <DepositForm
          onSubmit={async data => {
            await onSubmit(data)
            onFinish(data)
          }}
        />
      )}
      to={({ value, onBack }) => (
        <DepositDataProvider value={value}>
          <DepositVerify onBack={onBack} />
        </DepositDataProvider>
      )}
    />
  )
}
