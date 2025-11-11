import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { AddressQRModal } from '@core/ui/vault/chain/address/AddressQRModal'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
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
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const ModalBody = styled(VStack)`
  gap: 24px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    padding: 32px 32px 40px;
  }
`

const Header = styled(HStack)`
  align-items: center;
  justify-content: space-between;
`

const HeaderSpacer = styled.div`
  width: ${iconButtonSize.xl}px;
  height: ${iconButtonSize.xl}px;
  flex-shrink: 0;
`

const SearchFieldHalo = styled.div`
  width: 100%;
  border-radius: 32px;
  padding: 2px;
  background: linear-gradient(
    140deg,
    rgba(39, 86, 143, 0.7),
    rgba(5, 16, 32, 0.9)
  );
  box-shadow:
    0 25px 60px rgba(2, 5, 12, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
`

const ReceiveSearchField = styled(SearchField)`
  color: ${getColor('contrast')};

  border-radius: 99px;
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};
  box-shadow:
    0 0 4px 0 rgba(240, 244, 252, 0.04) inset,
    0 0 8px 0 rgba(240, 244, 252, 0.03) inset;

  input {
    color: ${getColor('textShy')};
    font-size: 13px;
  }
`

const ChainItemsWrapper = styled.div`
  border-radius: 24px;
  border: 1px solid var(--Borders-Light, #11284a);
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(1, 5, 15, 0.6);
`

const ChainListItem = styled.button<{ isEven: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: ${({ isEven }) =>
    isEven
      ? 'var(--Backgrounds-surface-2, #11284A)'
      : 'var(--Backgrounds-surface-1, #061B3A)'};
  border-bottom: 1px solid var(--Borders-Light, #11284a);
  cursor: pointer;
  transition: background 0.2s ease;
  color: ${getColor('contrast')};

  &:first-child {
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
  }

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
  }

  &:hover {
    background: ${({ isEven }) =>
      isEven ? 'rgba(17, 40, 74, 0.85)' : 'rgba(6, 27, 58, 0.9)'};
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
  border: 1.5px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
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
  const isTabletAndUp = useIsTabletDeviceAndUp()

  const filteredChains = useMemo(() => {
    if (!searchQuery.trim()) return chains
    const normalized = searchQuery.trim().toLowerCase()

    return chains.filter(chain => {
      const ticker = chainFeeCoin[chain]?.ticker ?? ''
      return (
        chain.toLowerCase().includes(normalized) ||
        ticker.toLowerCase().includes(normalized)
      )
    })
  }, [chains, searchQuery])

  if (selectedChain) {
    return <AddressQRModal chain={selectedChain} onClose={onClose} />
  }

  const modalContent = (
    <ModalBody>
      <Header>
        <IconButton kind="action" size="xl" onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
        <Text size={20} weight="600" color="contrast">
          {t('select_chain')}
        </Text>
        <HeaderSpacer />
      </Header>
      <SearchFieldHalo>
        <ReceiveSearchField value={searchQuery} onSearch={setSearchQuery} />
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
                  style={{ fontSize: 22 }}
                />
                <Text as="span" size={14} cropped>
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
    </ModalBody>
  )

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      containerStyles={{ padding: '32px 24px 40px' }}
      modalProps={{ withDefaultStructure: false }}
    >
      {isTabletAndUp ? (
        <ModalContainer targetWidth={480} placement="center">
          {modalContent}
        </ModalContainer>
      ) : (
        modalContent
      )}
    </ResponsiveModal>
  )
}
