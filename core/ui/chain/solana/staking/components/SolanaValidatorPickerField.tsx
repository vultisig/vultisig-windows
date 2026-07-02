import { useSolanaValidatorsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaValidatorsQuery'
import { Opener } from '@lib/ui/base/Opener'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { IconFileEdit } from '@lib/ui/icons/IconFileEdit'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import {
  truncatedPubkey,
  validatorDisplayName,
  validatorLogoUrl,
} from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SolanaValidatorAvatar } from './SolanaValidatorAvatar'
import { SolanaValidatorPickerSheet } from './SolanaValidatorPickerSheet'

type SolanaValidatorPickerFieldProps = {
  ticker: string
  /** Currently-selected vote pubkey, if any. */
  value?: string
  onChange: (votePubkey: string) => void
}

/**
 * Inline form field that opens the Solana validator picker sheet and renders the
 * selected validator's avatar + name + a success check + edit affordance once
 * one is picked. Mirrors the Cosmos `ValidatorPickerField`.
 */
export const SolanaValidatorPickerField = ({
  ticker,
  value,
  onChange,
}: SolanaValidatorPickerFieldProps) => {
  const { t } = useTranslation()
  const { data: validators } = useSolanaValidatorsQuery()
  const picked = value
    ? validators?.find(v => v.votePubkey === value)
    : undefined

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <FieldContainer onClick={onOpen}>
          <Text size={14} color="regular">
            {t('validator')}
          </Text>
          {value ? (
            <HStack alignItems="center" gap={8}>
              <SolanaValidatorAvatar
                name={picked ? validatorDisplayName(picked) : value}
                logoUrl={picked ? validatorLogoUrl(picked) : undefined}
                size={20}
              />
              <Text size={14} color="regular">
                {picked ? validatorDisplayName(picked) : truncatedPubkey(value)}
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
        <SolanaValidatorPickerSheet
          ticker={ticker}
          selectedVotePubkey={value}
          onClose={onClose}
          onSelect={validator => {
            onChange(validator.votePubkey)
            onClose()
          }}
        />
      )}
    />
  )
}

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
