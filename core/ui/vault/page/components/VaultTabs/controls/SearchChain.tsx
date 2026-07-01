import { useSearchChain } from '@core/ui/vault/page/state/searchChainProvider'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { CircleICloseIcon } from '@lib/ui/icons/CircleICloseIcon'
import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import {
  StationCircleXmarkFilledIcon,
  StationMagnifierIcon,
} from '@lib/ui/icons/StationFigmaIcons'
import { SearchField } from '@lib/ui/search/SearchField'
import { getColor } from '@lib/ui/theme/getters'
import { AnimatePresence, motion } from 'framer-motion'
import { useDeferredValue, useEffect, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

const debounceDelayMs = 250

type SearchChainProps = {
  onOpenChange?: (isOpen: boolean) => void
  isFullWidth?: boolean
}

export const SearchChain = ({
  onOpenChange,
  isFullWidth = false,
}: SearchChainProps) => {
  const [isOpen, { set, unset }] = useBoolean(false)
  const [searchQuery, setSearchQuery] = useSearchChain()
  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedValue = useDebounce(inputValue, debounceDelayMs)
  const deferredValue = useDeferredValue(debouncedValue)
  const [, startTransition] = useTransition()
  const { iconStyle } = useTheme()
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

  const handleClear = () => {
    setInputValue('')
    startTransition(() => setSearchQuery(''))
  }

  const isStation = iconStyle === 'station'

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
            <SearchRow>
              <SearchFieldWrapper fullWidth={isFullWidth}>
                <SearchField
                  value={inputValue}
                  onSearch={nextValue => setInputValue(nextValue)}
                />
                <CloseButton onClick={isStation ? handleClear : handleClose}>
                  {isStation ? (
                    <StationCircleXmarkFilledIcon />
                  ) : (
                    <CircleICloseIcon />
                  )}
                </CloseButton>
              </SearchFieldWrapper>
              {isStation && (
                <CancelButton onClick={handleClose}>{t('cancel')}</CancelButton>
              )}
            </SearchRow>
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
          <IconButton
            data-testid="vault-chain-search-button"
            kind="secondary"
            onClick={handleOpen}
            size="lg"
          >
            {iconStyle === 'station' ? (
              <StationMagnifierIcon />
            ) : (
              <SearchIcon />
            )}
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme.iconStyle === 'station' ? 12 : 0)}px;
  width: 100%;
`

const SearchFieldWrapper = styled.div<{ fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-height: ${({ theme }) => (theme.iconStyle === 'station' ? 48 : 42)}px;
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  & input {
    font-size: 12px;
    color: ${getColor('contrast')};
  }
`

const CloseButton = styled(UnstyledButton)`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  font-size: 20px;
  min-width: fit-content;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  width: fit-content;

  svg {
    color: ${({ theme }) =>
      theme.iconStyle === 'station'
        ? theme.colors.textShy.toCssValue()
        : theme.colors.foreground.toCssValue()};
    fill: ${({ theme }) =>
      theme.iconStyle === 'station'
        ? 'currentColor'
        : theme.colors.textShy.toCssValue()};
  }
`

const CancelButton = styled(UnstyledButton)`
  color: ${getColor('contrast')};
  flex: none;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;

  &:hover {
    color: ${getColor('textSupporting')};
  }
`
