import React, { useState } from 'react'
import styled from 'styled-components'

import { SearchIcon } from '../icons/SearchIcon'
import { getColor } from '../theme/getters'

interface SearchFieldProps {
  placeholder?: string
  onSearch?: (query: string) => void
}

export const SearchField: React.FC<SearchFieldProps> = ({
  // TODO: translate
  placeholder = 'Search...',
  onSearch,
}) => {
  const [query, setQuery] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    if (onSearch) {
      onSearch(event.target.value)
    }
  }

  return (
    <Wrapper>
      {!query && (
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
      )}
      <StyledInput
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={`  ${placeholder}`}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 7px 8px;
  position: relative;
  background-color: rgba(120, 120, 128, 0.12);
  border-radius: 10px;
`

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: ${getColor('textShy')};
`

const StyledInput = styled.input`
  width: 100%;
  padding: 10px;
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
