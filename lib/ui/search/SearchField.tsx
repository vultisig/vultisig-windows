import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { getColor } from '@lib/ui/theme/getters'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { HStack } from '../layout/Stack'

type SearchFieldProps = {
  placeholderKey?: string
  onSearch?: (query: string) => void
}

export const SearchField: React.FC<SearchFieldProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { t } = useTranslation()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    if (onSearch) {
      onSearch(event.target.value)
    }
  }

  return (
    <Wrapper justifyContent="center" alignItems="center" gap={8}>
      {!isFocused && (
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
      )}
      <StyledInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={!isFocused ? `  ${t('search_field_placeholder')}` : ''}
      />
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  position: relative;
  background-color: ${getColor('foreground')};
  border-radius: 10px;
  height: 48px;
`

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: ${getColor('textShy')};
`

const StyledInput = styled.input.attrs({ autoComplete: 'off' })`
  width: 100%;
  padding-left: 20px;
  line-height: 20px;
  font-size: 16px;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
  background-color: transparent;
  color: ${getColor('textShy')};

  &::placeholder {
    color: ${getColor('textShy')};
  }
`
