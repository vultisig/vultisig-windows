import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { MagnifyingGlassIcon } from '@lib/ui/icons/MagnifyingGlassIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ChainSearch = ({ onChange, value }: InputProps<string>) => {
  const [isFocused, setIsFocused] = useState(false)
  const { t } = useTranslation()

  return (
    <StyledTextInput
      inputOverlay={
        !isFocused ? (
          <InputOverlayWr gap={8} alignItems="center">
            <IconWrapper size={16}>
              <MagnifyingGlassIcon />
            </IconWrapper>
            <Text color="shy">{t('search_field_placeholder')}</Text>
          </InputOverlayWr>
        ) : null
      }
      onValueChange={onChange}
      value={value}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  )
}

const StyledTextInput = styled(TextInput)`
  border-radius: 99px;
  background: ${getColor('foreground')};
  box-shadow: 0 0 8px 0 rgba(240, 244, 252, 0.03) inset;
  height: 44px;
`

const InputOverlayWr = styled(HStack)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
`
