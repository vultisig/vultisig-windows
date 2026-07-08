import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { currentProductBrand } from '@core/ui/product/brand'
import { AddressQRModal } from '@core/ui/vault/chain/address/AddressQRModal'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { StationChevronLeftIcon } from '@lib/ui/icons/StationFigmaIcons'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ModalContainer } from '@lib/ui/modal/ModalContainer'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import {
  mediaQuery,
  useIsTabletDeviceAndUp,
} from '@lib/ui/responsive/mediaQuery'
import { SearchField } from '@lib/ui/search/SearchField'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { orderReceiveChainsForProduct } from '../utils/orderReceiveChainsForProduct'

const ModalBody = styled(VStack)`
  gap: 24px;
  min-height: 100%;

  @media ${mediaQuery.tabletDeviceAndUp} {
    padding: 0 0 24px;
    min-height: auto;
  }
`

const Header = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 56px;
  flex-shrink: 0;
  padding: 8px 8px 8px 16px;
  border-bottom: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('background')};
  backdrop-filter: blur(16px);
`

const HeaderSpacer = styled.div`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`

const HeaderBackButton = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: ${getColor('text')};
  font-size: 20px;
`

const SearchFieldHalo = styled.div`
  width: 100%;
  padding: 0;
  border-radius: 99px;
  background: transparent;
  box-shadow: none;
`

const ReceiveSearchField = styled(SearchField)`
  color: ${getColor('contrast')};

  border-radius: 99px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${({ theme }) =>
    theme.iconStyle === 'station'
      ? theme.colors.foregroundDark.toCssValue()
      : theme.colors.foreground.toCssValue()};
  box-shadow:
    0 0 4px 0 rgba(240, 244, 252, 0.04) inset,
    0 0 8px 0 rgba(240, 244, 252, 0.03) inset;
  height: 42px;

  input {
    color: ${getColor('textShy')};
    font-size: 13px;
  }
`

const ChainItemsWrapper = styled.div`
  border-radius: 24px;
  border: none;
  overflow: hidden;
  box-shadow: none;
`

const ChainListItem = styled.button<{ isEven: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 58px;
  padding: 12px 20px;
  border: none;
  background: ${({ isEven, theme }) =>
    isEven
      ? theme.colors.foregroundExtra.toCssValue()
      : theme.colors.foreground.toCssValue()};
  border-bottom: 1px solid ${getColor('foregroundSuper')};
  cursor: pointer;
  transition: background 0.2s ease;
  color: ${getColor('contrast')};

  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
  }

  &:hover {
    background: ${({ isEven, theme }) =>
      isEven
        ? theme.colors.foregroundExtra.toCssValue()
        : theme.colors.foreground.toCssValue()};
  }

  &:focus-visible {
    outline: 2px solid ${getColor('primary')};
    outline-offset: -2px;
  }
`

const ChainBadge = styled(Text)`
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  border-radius: 99px;
  border: 1.5px solid ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};
`

const ChainSelectionContent = styled(VStack)`
  gap: 16px;
  padding: 0 16px;
`

const EmptyStateMessage = styled(Text)`
  text-align: center;
  width: 100%;
`

export const ReceiveModal = ({ onClose }: OnCloseProp) => {
  const chains = useCurrentVaultChains()
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation()
  const { iconStyle } = useTheme()
  const isStation = iconStyle === 'station'
  const isTabletAndUp = useIsTabletDeviceAndUp()

  const orderedChains = useMemo(
    () =>
      orderReceiveChainsForProduct({
        chains,
        productBrand: currentProductBrand,
      }),
    [chains]
  )

  const filteredChains = useMemo(() => {
    if (!searchQuery.trim()) return orderedChains
    const normalized = searchQuery.trim().toLowerCase()

    return orderedChains.filter(chain => {
      const ticker = chainFeeCoin[chain]?.ticker ?? ''
      return (
        chain.toLowerCase().includes(normalized) ||
        ticker.toLowerCase().includes(normalized)
      )
    })
  }, [orderedChains, searchQuery])

  if (selectedChain) {
    return <AddressQRModal chain={selectedChain} onClose={onClose} />
  }

  const modalContent = (
    <ModalBody>
      <Header>
        <HeaderBackButton onClick={onClose} aria-label={t('back')}>
          {isStation ? <StationChevronLeftIcon /> : <ChevronLeftIcon />}
        </HeaderBackButton>
        <Text size={14} weight="500" color="contrast">
          {t('select_chain')}
        </Text>
        <HeaderSpacer />
      </Header>
      <ChainSelectionContent>
        <SearchFieldHalo>
          <ReceiveSearchField
            showPlaceholderWhenFocused
            value={searchQuery}
            onSearch={setSearchQuery}
          />
        </SearchFieldHalo>
        {filteredChains.length ? (
          <ChainItemsWrapper>
            {filteredChains.map((chain, index) => {
              const ticker =
                chainFeeCoin[chain]?.ticker ?? chain.slice(0, 4).toUpperCase()

              return (
                <ChainListItem
                  key={chain}
                  type="button"
                  onClick={() => setSelectedChain(chain)}
                  isEven={index % 2 === 1}
                >
                  <ChainEntityIcon
                    value={getChainLogoSrc(chain)}
                    style={{ fontSize: 32 }}
                  />
                  <Text as="span" size={14} weight="500" cropped>
                    {ticker}
                  </Text>
                  <ChainBadge as="span" size={10} color="shyExtra" weight="500">
                    {chain}
                  </ChainBadge>
                </ChainListItem>
              )
            })}
          </ChainItemsWrapper>
        ) : (
          <EmptyStateMessage size={14} color="shy">
            {t('no_chains_found')}
          </EmptyStateMessage>
        )}
      </ChainSelectionContent>
    </ModalBody>
  )

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      grabbable={false}
      mobilePresentation="fullscreen"
      containerStyles={{ padding: 0 }}
      modalProps={{ withDefaultStructure: false }}
    >
      {isTabletAndUp ? (
        <ModalContainer targetWidth={360} placement="center">
          {modalContent}
        </ModalContainer>
      ) : (
        modalContent
      )}
    </ResponsiveModal>
  )
}
