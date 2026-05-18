import { ValidatorAvatar } from '@core/ui/chain/cosmos/staking/components/ValidatorAvatar'
import { ValidatorPickerSheet } from '@core/ui/chain/cosmos/staking/components/ValidatorPickerSheet'
import { useCosmosValidatorsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosValidatorsQuery'
import { Opener } from '@lib/ui/base/Opener'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { IconFileEdit } from '@lib/ui/icons/IconFileEdit'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ValidatorPickerFieldProps = {
  chain: IbcEnabledCosmosChain
  ticker: string
  decimals: number
  /** Currently-selected valoper, if any. */
  value?: string
  /** Source validator to hide in the dst picker (for redelegate flow). */
  excludeValidatorAddress?: string
  onChange: (validatorAddress: string) => void
}

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
              <ValidatorAvatar moniker={picked.description.moniker} size={20} />
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

const FieldContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  cursor: pointer;
  background: transparent;

  &:hover {
    background: ${getColor('foregroundExtra')};
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
