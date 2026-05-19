import { ValidatorPickerSheet } from '@core/ui/chain/cosmos/staking/components/ValidatorPickerSheet'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type CosmosStakingFooterButtonProps = {
  action: 'delegate' | 'redelegate'
}

/**
 * Page-bottom CTA for cosmos delegate / redelegate. Three states, in order
 * of precedence:
 *   1. Amount not set → "Enter Amount", disabled.
 *   2. Amount set, validator not picked → "Select Validator", opens the
 *      picker sheet. The picker is the SAME sheet that the inline Validator
 *      field opens — both keep `validatorAddress` in sync via react-hook-form.
 *   3. Amount + validator both set → "Continue", `type=submit` so the
 *      enclosing form runs its `onSubmit`.
 *
 * The component lives at the page footer (not inside the scrollable action
 * area) so the button stays pinned to the bottom of the screen.
 */
export const CosmosStakingFooterButton = ({
  action,
}: CosmosStakingFooterButtonProps) => {
  const { t } = useTranslation()
  const [{ control, chain }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()

  // Form values are loosely typed (`Record<string, any>`): typing into the
  // amount input emits a string, the PercentageSelector pills emit a number
  // (`fromChainAmount` returns number). Normalize via `Number(...)` so both
  // paths flip the button into the "Select Validator" state.
  const amount = useWatch({ control, name: 'amount' }) as
    | string
    | number
    | undefined
  const validatorAddress = useWatch({ control, name: 'validatorAddress' }) as
    | string
    | undefined
  const srcValidatorAddress = useWatch({
    control,
    name: 'srcValidatorAddress',
  }) as string | undefined

  const numericAmount = Number(amount ?? 0)
  const amountSet = Number.isFinite(numericAmount) && numericAmount > 0
  const validatorPicked = Boolean(validatorAddress)

  // Redelegate from the Wallet → Function entry starts on the
  // `ActiveDelegationPicker` step (source not yet picked). The footer
  // CTA would prematurely offer to open the destination picker, so
  // suppress it until source is chosen.
  if (action === 'redelegate' && !srcValidatorAddress) {
    return null
  }

  if (!amountSet) {
    return (
      <Button disabled type="button">
        {t('enter_amount')}
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
            <ValidatorPickerSheet
              chain={chain as IbcEnabledCosmosChain}
              ticker={coin.ticker}
              decimals={coin.decimals}
              selectedValidatorAddress={field.value as string | undefined}
              excludeValidatorAddress={
                action === 'redelegate' ? srcValidatorAddress : undefined
              }
              onSelect={validator => {
                field.onChange(validator.operatorAddress)
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
