import { ValidatorAvatar } from '@core/ui/chain/cosmos/staking/components/ValidatorAvatar'
import { ValidatorPickerSheet } from '@core/ui/chain/cosmos/staking/components/ValidatorPickerSheet'
import { useCosmosValidatorsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosValidatorsQuery'
import { Opener } from '@lib/ui/base/Opener'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { IconFileEdit } from '@lib/ui/icons/IconFileEdit'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { StakingChain } from '@vultisig/core-chain/chains/cosmos/staking/lcdQueries'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ValidatorPickerFieldProps = {
  chain: StakingChain
  ticker: string
  decimals: number
  /** Currently-selected valoper, if any. */
  value?: string
  /** Source validator to hide in the dst picker (for redelegate flow). */
  excludeValidatorAddress?: string
  onChange: (validatorAddress: string) => void
}

/**
 * Inline form field that opens the validator picker sheet on activation
 * and renders the currently-selected validator's avatar + moniker + a
 * success check + edit affordance once one is picked.
 *
 * Used by `DelegateSpecific` (target validator) and `RedelegateSpecific`
 * (destination validator, with the source excluded from the list).
 */
export const ValidatorPickerField = ({
  chain,
  ticker,
  decimals,
  value,
  excludeValidatorAddress,
  onChange,
}: ValidatorPickerFieldProps) => {
  const { t } = useTranslation()
  // Pull the picked validator's moniker out of the cached list so the field
  // can render the name + avatar without a per-row fetch. Cached set is shared
  // with the picker sheet, so opening the sheet does not re-fetch.
  const { data: validators } = useCosmosValidatorsQuery(chain)
  const picked = value
    ? validators?.find(v => v.operatorAddress === value)
    : undefined

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <FieldContainer onClick={onOpen}>
          <Text size={14} color="regular">
            {t('validator')}
          </Text>
          {picked ? (
            <HStack alignItems="center" gap={8}>
              <ValidatorAvatar
                moniker={picked.description.moniker}
                identity={picked.description.identity}
                size={20}
              />
              <Text size={14} color="regular">
                {picked.description.moniker || picked.operatorAddress}
              </Text>
              <SelectedBadge>
                <CircleCheckIcon />
              </SelectedBadge>
              <EditIconWrap>
                <IconFileEdit />
              </EditIconWrap>
            </HStack>
          ) : null}
        </FieldContainer>
      )}
      renderContent={({ onClose }) => (
        <ValidatorPickerSheet
          chain={chain}
          ticker={ticker}
          decimals={decimals}
          selectedValidatorAddress={value}
          excludeValidatorAddress={excludeValidatorAddress}
          onClose={onClose}
          onSelect={validator => {
            onChange(validator.operatorAddress)
            onClose()
          }}
        />
      )}
    />
  )
}

// `<button>` keeps the opener keyboard-accessible (Space / Enter activate
// it without extra `tabIndex` / `onKeyDown` wiring) and gives assistive
// tech a built-in "button" role. type="button" prevents the native
// submit-on-click that bare <button> elements have inside a <form>.
const FieldContainer = styled.button.attrs({ type: 'button' as const })`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  cursor: pointer;
  background: transparent;
  color: inherit;
  text-align: left;
  font: inherit;
  width: 100%;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }

  &:focus-visible {
    outline: 2px solid ${getColor('primary')};
    outline-offset: 2px;
  }
`

const SelectedBadge = styled.div`
  color: ${getColor('success')};
  display: flex;
  align-items: center;
  font-size: 18px;
`

const EditIconWrap = styled.div`
  color: ${getColor('textShy')};
  display: flex;
  align-items: center;
  font-size: 18px;
`
