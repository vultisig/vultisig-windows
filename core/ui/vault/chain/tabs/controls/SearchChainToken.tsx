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

import { useSearchChainToken } from '../../state/searchChainTokenProvider'

const debounceDelayMs = 250

type SearchChainTokenProps = {
  onOpenChange?: (isOpen: boolean) => void
  isFullWidth?: boolean
}

export const SearchChainToken = ({
  onOpenChange,
  isFullWidth = false,
}: SearchChainTokenProps) => {
  const [isOpen, { set, unset }] = useBoolean(false)
  const [searchQuery, setSearchQuery] = useSearchChainToken()
  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedValue = useDebounce(inputValue, debounceDelayMs)
  const deferredValue = useDeferredValue(debouncedValue)
  const [, startTransition] = useTransition()
  const { t } = useTranslation()

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    startTransition(() => setSearchQuery(deferredValue))
  }, [deferredValue, setSearchQuery, startTransition])

  const handleOpen = () => {
    set()
    onOpenChange?.(true)
  }

  const handleClose = () => {
    setInputValue('')
    startTransition(() => setSearchQuery(''))
    unset()
    onOpenChange?.(false)
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen ? (
        <motion.div
          key="search-field"
          initial={{ width: 0 }}
          animate={{ width: isFullWidth ? '100%' : 'auto' }}
          exit={{ width: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <HStack
              gap={8}
              alignItems="center"
              style={{ minWidth: 'max-content' }}
            >
              <SearchFieldWrapper $fullWidth={isFullWidth}>
                <SearchField
                  value={inputValue}
                  onSearch={nextValue => setInputValue(nextValue)}
                />
              </SearchFieldWrapper>
              <CloseButton onClick={handleClose}>
                <Text size={14}>{t('vault_search_close')}</Text>
              </CloseButton>
            </HStack>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="search-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <IconButton onClick={handleOpen} size="lg">
            <SearchIcon />
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SearchFieldWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  max-height: 42px;
  flex: 1;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  & input {
    font-size: 12px;
    color: ${getColor('contrast')};
  }
`

const CloseButton = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;
  min-width: fit-content;
  width: fit-content;
`
