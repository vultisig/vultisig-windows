import { InputPasteAction } from '@core/ui/components/InputPasteAction'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
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

export const SearchInput = ({ onChange, value }: InputProps<string>) => {
  const [isFocused, setIsFocused] = useState(false)
  const { t } = useTranslation()

  return (
    <ActionInsideInteractiveElement
      render={({ actionSize }) => (
        <InputWrapper $hasBorder={!!value}>
          <StyledTextInput
            inputOverlay={
              !isFocused &&
              !value && (
                <InputOverlayWr gap={8} alignItems="center">
                  <IconWrapper size={16}>
                    <MagnifyingGlassIcon />
                  </IconWrapper>
                  <Text color="shy">{t('search_field_placeholder')}</Text>
                </InputOverlayWr>
              )
            }
            onValueChange={onChange}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              paddingRight: actionSize.width + 8,
            }}
          />
        </InputWrapper>
      )}
      action={
        value ? (
          <StyledIconButton size="sm" onClick={() => onChange('')}>
            <CloseIcon />
          </StyledIconButton>
        ) : (
          <StyledInputPasteAction
            onPaste={value => {
              onChange(value.trim())
            }}
          />
        )
      }
      actionPlacerStyles={{
        top: '50%',
        transform: 'translateY(-50%)',
        right: 8,
      }}
    />
  )
}

const InputWrapper = styled.div<{ $hasBorder?: boolean }>`
  border-radius: 99px;
  border: ${({ $hasBorder }) =>
    $hasBorder ? `1.5px solid ${getColor('primary')}` : 'none'};
`

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

const StyledInputPasteAction = styled(InputPasteAction)`
  color: ${getColor('textShy')};
  font-size: 20px;
`

const StyledIconButton = styled(IconButton)`
  color: ${getColor('textShy')};
  font-size: 20px;
`
