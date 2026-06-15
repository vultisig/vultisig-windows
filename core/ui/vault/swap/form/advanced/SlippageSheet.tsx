import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AdvancedSheet } from './AdvancedSheet'
import { SlippageMode, SlippageValue } from './slippage'

type SlippageSheetProps = OnCloseProp & {
  value: SlippageValue
  onChange: (value: SlippageValue) => void
}

const presetModes: Exclude<SlippageMode, 'custom'>[] = ['auto', '0.5', '1', '3']

export const SlippageSheet = ({
  value,
  onChange,
  onClose,
}: SlippageSheetProps) => {
  const { t } = useTranslation()
  const [customText, setCustomText] = useState(
    value.mode === 'custom' && value.customPercent
      ? String(value.customPercent)
      : ''
  )

  const presetLabel = (mode: Exclude<SlippageMode, 'custom'>) =>
    mode === 'auto' ? t('auto') : `${mode}%`

  return (
    <AdvancedSheet title={t('slippage')} onClose={onClose} onConfirm={onClose}>
      <Text size={14} weight={400} color="shy">
        {t('slippage_helper')}
      </Text>
      <List border="solid">
        {presetModes.map(mode => (
          <ListItem
            key={mode}
            onClick={() => onChange({ ...value, mode })}
            title={
              <Text size={14} weight={400} color="shyExtra">
                {presetLabel(mode)}
              </Text>
            }
            extra={
              <Checkbox
                value={value.mode === mode}
                onChange={() => onChange({ ...value, mode })}
              />
            }
          />
        ))}
        <ListItem
          onClick={() =>
            onChange({ mode: 'custom', customPercent: value.customPercent })
          }
          title={
            <HStack alignItems="center" gap={6}>
              <Text size={14} weight={400} color="shyExtra">
                {t('slippage_custom')}
              </Text>
              <CustomInput
                inputMode="decimal"
                placeholder="0.00"
                value={customText}
                onChange={event => {
                  const next = event.target.value
                  setCustomText(next)
                  onChange({ mode: 'custom', customPercent: Number(next) || 0 })
                }}
              />
              <Text size={14} weight={400} color="shyExtra">
                %
              </Text>
            </HStack>
          }
          extra={
            <Checkbox
              value={value.mode === 'custom'}
              onChange={() =>
                onChange({ mode: 'custom', customPercent: value.customPercent })
              }
            />
          }
        />
      </List>
    </AdvancedSheet>
  )
}

const CustomInput = styled.input`
  width: 56px;
  border: none;
  outline: none;
  background: transparent;
  color: ${getColor('textShyExtra')};
  font-size: 14px;
  font-weight: 400;

  &::placeholder {
    color: ${getColor('textShy')};
  }
`
