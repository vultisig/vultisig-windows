import {
  useForgetSolanaMoveStakeDestinationsMutation,
  useSetSolanaMoveStakeDestinationMutation,
} from '@core/ui/storage/solanaMoveStakeDestinations'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { FieldValues } from 'react-hook-form'

import { DepositForm } from './DepositForm'
import { DepositVerify } from './DepositVerify'
import { useDepositAction } from './providers/DepositActionProvider'
import { useDepositCoin } from './providers/DepositCoinProvider'
import { DepositDataProvider } from './state/data'

export const DepositPage = () => {
  const [action] = useDepositAction()
  const [coin] = useDepositCoin()
  const { mutate: rememberMoveDestination } =
    useSetSolanaMoveStakeDestinationMutation()
  const { mutate: forgetMoveDestinations } =
    useForgetSolanaMoveStakeDestinationsMutation()

  // A Solana move deactivates the stake account now and re-delegates it only
  // after the ~1-epoch cooldown, so the destination picked on the Move step has
  // to outlive this flow (and the app session) to prefill Finish Move days
  // later. A plain unstake on the same account supersedes any move in flight.
  const onSubmit = (data: FieldValues) => {
    const { stakeAccount, validatorAddress } = data

    if (action === 'solana_move_stake') {
      rememberMoveDestination({
        stakeAccount,
        owner: coin.address,
        votePubkey: validatorAddress,
      })
    }

    if (action === 'solana_unstake') {
      forgetMoveDestinations([stakeAccount])
    }
  }

  return (
    <ValueTransfer<FieldValues>
      from={({ onFinish }) => (
        <DepositForm
          onSubmit={data => {
            onSubmit(data)
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
