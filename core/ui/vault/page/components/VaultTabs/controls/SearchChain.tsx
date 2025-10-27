import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { SearchField } from '@lib/ui/search/SearchField'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { AnimatePresence, motion } from 'framer-motion'
import { useDeferredValue, useEffect, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSearchChain } from '../../../state/searchChainProvider'

const debounceDelayMs = 250

export const SearchChain = () => {
  const [isOpen, { set, unset }] = useBoolean(false)
  const [searchQuery, setSearchQuery] = useSearchChain()
  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedValue = useDebounce(inputValue, debounceDelayMs)
  const deferredValue = useDeferredValue(debouncedValue)
  const [isPending, startTransition] = useTransition()
  const { t } = useTranslation()

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    startTransition(() => setSearchQuery(deferredValue))
  }, [deferredValue, setSearchQuery, startTransition])

  const handleClose = () => {
    setInputValue('')
    startTransition(() => setSearchQuery(''))
    unset()
  }

  const hasActiveQuery = inputValue.trim().length > 0

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          key="search-field"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <HStack gap={8} alignItems="center">
            <SearchFieldWrapper>
              <SearchField
                value={inputValue}
                onSearch={nextValue => setInputValue(nextValue)}
              />
            </SearchFieldWrapper>
            {hasActiveQuery && (
              <StatusText color="supporting" size={10}>
                {isPending
                  ? t('vault_search_updating')
                  : t('vault_search_filtered')}
              </StatusText>
            )}
            <UnstyledButton onClick={handleClose}>
              <Text>{t('vault_search_close')}</Text>
            </UnstyledButton>
          </HStack>
        </motion.div>
      ) : (
        <motion.div
          key="search-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <IconButton onClick={set} size="lg">
            <SearchIcon />
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SearchFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 30px;

  & input {
    font-size: 12px;
    color: ${getColor('contrast')};
  }
`

const StatusText = styled(Text)`
  min-width: 60px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`
