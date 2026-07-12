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

/**
 * The Solana staking actions whose destination validator is chosen on the form
 * itself, so their CTA has to gate on the pick. The rest carry a prefilled
 * destination and keep the default Continue.
 */
export const solanaValidatorPickerActions = [
  'solana_delegate',
  'solana_move_stake',
] as const

type SolanaStakingFooterButtonProps = {
  action: (typeof solanaValidatorPickerActions)[number]
}

// Solana Stake program minimum active delegation, in whole SOL (1 SOL on
// mainnet). A DelegateStake below it reverts on-chain with
// StakeError.InsufficientDelegation, so the CTA gates on it up front.
const minDelegationSol =
  Number(solanaStakingConfig.minDelegationFloorLamports) / 10 ** solDecimals

/**
 * Page-bottom CTA for the Solana forms that pick a validator. States, in order:
 *   1. Amount not set → "Enter Amount", disabled. Delegate only — a move sends
 *      the whole stake account, so it has no amount to enter.
 *   2. Amount below the 1 SOL program minimum → disabled minimum-delegation hint.
 *   3. Validator not picked → "Select Validator", opens the picker sheet (the
 *      same sheet the inline validator field opens; both keep `validatorAddress`
 *      in sync via react-hook-form).
 *   4. Everything set → "Continue" (`type=submit`).
 *
 * Lives at the page footer so it stays pinned outside the scrollable form,
 * mirroring `CosmosStakingFooterButton`. The ops that carry a prefilled
 * destination (unstake / withdraw / finish-move) keep the default Continue.
 */
export const SolanaStakingFooterButton = ({
  action,
}: SolanaStakingFooterButtonProps) => {
  const { t } = useTranslation()
  const [{ control }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()

  // Form values are loosely typed (`Record<string, any>`), so narrow rather
  // than assert: typing into the amount input emits a string while the
  // percentage pills emit a number, and the validator fields are only ever set
  // by the picker (or the DeFi prefill).
  const amount = useWatch({ control, name: 'amount' })
  const watchedValidator = useWatch({ control, name: 'validatorAddress' })
  const validatorAddress =
    typeof watchedValidator === 'string' ? watchedValidator : undefined
  const watchedSrcValidator = useWatch({ control, name: 'srcValidatorAddress' })
  const srcValidatorAddress =
    typeof watchedSrcValidator === 'string' ? watchedSrcValidator : undefined

  const requiresAmount = action === 'solana_delegate'
  const numericAmount = Number(amount ?? 0)
  const amountSet = Number.isFinite(numericAmount) && numericAmount > 0
  const belowMinimum = amountSet && numericAmount < minDelegationSol
  const validatorPicked = Boolean(validatorAddress)

  if (requiresAmount && !amountSet) {
    return (
      <Button disabled type="button">
        {t('enter_amount')}
      </Button>
    )
  }

  if (requiresAmount && belowMinimum) {
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
              selectedVotePubkey={
                typeof field.value === 'string' ? field.value : undefined
              }
              excludeVotePubkey={
                action === 'solana_move_stake' ? srcValidatorAddress : undefined
              }
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
