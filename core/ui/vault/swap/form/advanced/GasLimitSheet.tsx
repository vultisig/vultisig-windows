import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AdvancedSheet } from './AdvancedSheet'
import { SheetBackIcon } from './icons/SheetBackIcon'
import { SheetInfoIcon } from './icons/SheetInfoIcon'

type GasLimitSheetProps = OnCloseProp & {
  value: string
  onChange: (value: string) => void
}

export const GasLimitSheet = ({
  value,
  onChange,
  onClose,
}: GasLimitSheetProps) => {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(value)

  const apply = () => {
    onChange(draft)
    onClose()
  }

  return (
    <AdvancedSheet
      title={t('gas_limit')}
      onClose={onClose}
      onConfirm={apply}
      leftIcon={<SheetBackIcon />}
    >
      <VStack gap={8}>
        <HStack alignItems="center" gap={6}>
          <Text size={14} weight={500} color="shy">
            {t('gas_limit')}
          </Text>
          <IconWrapper size={16} color="textShy">
            <SheetInfoIcon />
          </IconWrapper>
        </HStack>
        <GasInput
          inputMode="numeric"
          placeholder={t('auto')}
          value={draft}
          onChange={event => setDraft(event.target.value.replace(/\D/g, ''))}
        />
      </VStack>
    </AdvancedSheet>
  )
}

const GasInput = styled.input`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  border: 1px solid rgba(255, 255, 255, 0.03);
  color: ${getColor('text')};
  font-size: 14px;
  font-weight: 500;
  outline: none;

  &::placeholder {
    color: ${getColor('textShy')};
  }

  &:focus {
    border-color: ${getColor('foregroundSuper')};
  }
`
