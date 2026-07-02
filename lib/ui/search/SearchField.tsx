import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { StationMagnifierIcon } from '@lib/ui/icons/StationFigmaIcons'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { UiProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

type SearchFieldProps = UiProps & {
  placeholderKey?: string
  value?: string
  onSearch?: (query: string) => void
}

export const SearchField: React.FC<SearchFieldProps> = ({
  onSearch,
  value,
  className,
  style,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { t } = useTranslation()
  const { iconStyle } = useTheme()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    if (value === undefined) {
      setUncontrolledValue(nextValue)
    }
    onSearch?.(nextValue)
  }

  const query = value ?? uncontrolledValue

  return (
    <Wrapper
      className={className}
      style={style}
      justifyContent="center"
      alignItems="center"
      gap={8}
    >
      {!isFocused && (
        <SearchIconWrapper>
          {iconStyle === 'station' ? (
            <StationMagnifierIcon />
          ) : (
            <SearchIcon strokeWidth={2.5} />
          )}
        </SearchIconWrapper>
      )}
      <StyledInput
        autoFocus
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={!isFocused ? t('search_field_placeholder') : ''}
      />
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  position: relative;
  background-color: ${getColor('foreground')};
  border-radius: ${({ theme }) =>
    theme.iconStyle === 'station' ? '99px' : '10px'};
  height: 48px;
  flex: none;

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      background-color: ${theme.colors.foregroundDark.toCssValue()};
      border: 1px solid ${theme.colors.foregroundExtra.toCssValue()};
      box-shadow:
        inset 0 0 4px rgba(240, 244, 252, 0.04),
        inset 0 0 8px rgba(240, 244, 252, 0.03);
    `}
`

const SearchIconWrapper = styled(VStack)`
  color: ${getColor('textShy')};
  font-size: 20px;
  left: 8px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`

const StyledInput = styled.input.attrs({ autoComplete: 'off' })`
  width: 100%;
  padding-left: 32px;
  line-height: ${({ theme }) => (theme.iconStyle === 'station' ? 18 : 20)}px;
  font-size: ${({ theme }) => (theme.iconStyle === 'station' ? 13 : 16)}px;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
  background-color: transparent;
  color: ${getColor('contrast')};
  font-weight: ${({ theme }) => (theme.iconStyle === 'station' ? 500 : 400)};
  letter-spacing: ${({ theme }) =>
    theme.iconStyle === 'station' ? '0.06px' : 0};

  &::placeholder {
    color: ${getColor('textShy')};
    font-weight: ${({ theme }) => (theme.iconStyle === 'station' ? 500 : 400)};
  }
`
