import { SolanaValidatorPickerSheet } from '@core/ui/chain/solana/staking/components/SolanaValidatorPickerSheet'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import {
  solanaStakingConfig,
  solDecimals,
} from '@vultisig/core-chain/chains/solana/staking/config'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

// Solana Stake program minimum active delegation, in whole SOL (1 SOL on
// mainnet). A DelegateStake below it reverts on-chain with
// StakeError.InsufficientDelegation, so the CTA gates on it up front.
const minDelegationSol =
  Number(solanaStakingConfig.minDelegationFloorLamports) / 10 ** solDecimals

/**
 * Page-bottom CTA for the Solana delegate form. States, in order:
 *   1. Amount not set → "Enter Amount", disabled.
 *   2. Amount below the 1 SOL program minimum → disabled minimum-delegation hint.
 *   3. Amount set, validator not picked → "Select Validator", opens the picker
 *      sheet (the same sheet the inline validator field opens; both keep
 *      `validatorAddress` in sync via react-hook-form).
 *   4. Amount + validator both set → "Continue" (`type=submit`).
 *
 * Lives at the page footer so it stays pinned outside the scrollable form,
 * mirroring `CosmosStakingFooterButton`. The account-scoped ops (unstake /
 * withdraw) carry prefilled defaults, so they keep the default Continue.
 */
export const SolanaStakingFooterButton = () => {
  const { t } = useTranslation()
  const [{ control }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()

  const amount = useWatch({ control, name: 'amount' }) as
    | string
    | number
    | undefined
  const validatorAddress = useWatch({ control, name: 'validatorAddress' }) as
    | string
    | undefined

  const numericAmount = Number(amount ?? 0)
  const amountSet = Number.isFinite(numericAmount) && numericAmount > 0
  const belowMinimum = amountSet && numericAmount < minDelegationSol
  const validatorPicked = Boolean(validatorAddress)

  if (!amountSet) {
    return (
      <Button disabled type="button">
        {t('enter_amount')}
      </Button>
    )
  }

  if (belowMinimum) {
    return (
      <Button disabled type="button">
        {t('solana_staking_min_delegation', {
          amount: minDelegationSol,
          ticker: coin.ticker,
        })}
      </Button>
    )
  }

  if (validatorPicked) {
    return <Button type="submit">{t('continue')}</Button>
  }

  return (
    <Controller
      control={control}
      name="validatorAddress"
      render={({ field }) => (
        <Opener
          renderOpener={({ onOpen }) => (
            <Button type="button" onClick={onOpen}>
              {t('select_validator')}
            </Button>
          )}
          renderContent={({ onClose }) => (
            <SolanaValidatorPickerSheet
              ticker={coin.ticker}
              selectedVotePubkey={field.value as string | undefined}
              onSelect={validator => {
                field.onChange(validator.votePubkey)
                onClose()
              }}
              onClose={onClose}
            />
          )}
        />
      )}
    />
  )
}
