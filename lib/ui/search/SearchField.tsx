import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { StationMagnifierIcon } from '@lib/ui/icons/StationFigmaIcons'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { UiProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { borderRadius } from '../css/borderRadius'

/**
 * `pill` is the fully rounded, bordered field from the current design system;
 * `default` keeps the legacy 12px surface. The station theme always renders
 * the pill regardless of this prop.
 */
type SearchFieldVariant = 'default' | 'pill'

type SearchFieldProps = UiProps & {
  autoFocus?: boolean
  showPlaceholderWhenFocused?: boolean
  value?: string
  onSearch?: (query: string) => void
  variant?: SearchFieldVariant
}

/**
 * Search input with a leading lens. Uncontrolled unless `value` is passed;
 * `onSearch` fires on every keystroke either way.
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  autoFocus = true,
  onSearch,
  showPlaceholderWhenFocused = false,
  value,
  variant = 'default',
  className,
  style,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { t } = useTranslation()
  const { iconStyle } = useTheme()
  const isPill = variant === 'pill' || iconStyle === 'station'

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
      $isPill={isPill}
    >
      <SearchIconWrapper aria-hidden>
        {iconStyle === 'station' ? (
          <StationMagnifierIcon />
        ) : (
          <SearchIcon strokeWidth={2.5} />
        )}
      </SearchIconWrapper>
      <StyledInput
        $isPill={isPill}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={
          !isFocused || showPlaceholderWhenFocused
            ? t('search_field_placeholder')
            : ''
        }
      />
    </Wrapper>
  )
}

const Wrapper = styled(HStack)<{ $isPill: boolean }>`
  position: relative;
  background-color: ${getColor('foreground')};
  ${({ $isPill }) => ($isPill ? borderRadius.pill : borderRadius.md)};
  height: 48px;
  flex: none;

  ${({ $isPill }) =>
    $isPill &&
    css`
      border: 1px solid ${getColor('foregroundExtra')};
      box-shadow:
        inset 0 0 4px rgba(240, 244, 252, 0.04),
        inset 0 0 8px rgba(240, 244, 252, 0.03);
      transition: border-color 0.2s;

      &:focus-within {
        border-color: ${getColor('foregroundSuper')};
      }
    `}

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      background-color: ${getColor('foregroundDark')};
    `}
`

const SearchIconWrapper = styled(VStack)`
  color: ${getColor('text')};
  font-size: 20px;
  left: 8px;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`

const StyledInput = styled.input.attrs({ autoComplete: 'off' })<{
  $isPill: boolean
}>`
  width: 100%;
  padding-left: 32px;
  line-height: ${({ $isPill }) => ($isPill ? 18 : 20)}px;
  font-size: ${({ $isPill }) => ($isPill ? 13 : 16)}px;
  ${borderRadius.xs};
  outline: none;
  background-color: transparent;
  color: ${getColor('contrast')};
  font-weight: ${({ $isPill }) => ($isPill ? 500 : 400)};
  letter-spacing: ${({ $isPill }) => ($isPill ? '0.06px' : 0)};

  &::placeholder {
    color: ${getColor('textShy')};
    font-weight: ${({ $isPill }) => ($isPill ? 500 : 400)};
  }
`
