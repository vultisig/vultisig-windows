import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins, Coin } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { ChainSearch } from './ChainSearch'

const NativeCoinItem: FC<Coin> = coin => {
  const currentCoins = useCurrentVaultNativeCoins()
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()

  const currentCoin = useMemo(() => {
    return currentCoins.find(c => areEqualCoins(c, coin))
  }, [currentCoins, coin])

  const isSelected = !!currentCoin
  const isLoading = createCoin.isPending || deleteCoin.isPending

  const handleClick = () => {
    if (isLoading) return
    if (currentCoin) {
      deleteCoin.mutate(currentCoin)
    } else {
      createCoin.mutate(coin)
    }
  }

  return (
    <ChainCard
      onClick={handleClick}
      $isSelected={isSelected}
      $isLoading={isLoading}
    >
      <ChainIconWrapper>
        <ChainEntityIcon
          value={getChainLogoSrc(coin.chain)}
          style={{ fontSize: 27.5 }}
        />
        {isSelected && (
          <CheckBadge>
            <CheckIcon style={{ fontSize: 16 }} />
          </CheckBadge>
        )}
      </ChainIconWrapper>
      <Text color="contrast" size={16} weight={500}>
        {coin.chain}
      </Text>
    </ChainCard>
  )
}

export const ManageVaultChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const nativeCoins = Object.values(chainFeeCoin)
  const currentNativeCoins = useCurrentVaultNativeCoins()
  const navigate = useCoreNavigate()

  const filteredNativeCoins = useMemo(() => {
    if (!search) return nativeCoins

    const normalizedSearch = search.toLowerCase()

    return nativeCoins.filter(
      ({ chain, ticker }) =>
        chain.toLowerCase().includes(normalizedSearch) ||
        ticker.toLowerCase().includes(normalizedSearch)
    )
  }, [nativeCoins, search])

  const activeNativeCoins = useMemo(() => {
    return filteredNativeCoins.filter(coin =>
      currentNativeCoins.some(c => areEqualCoins(c, coin))
    )
  }, [currentNativeCoins, filteredNativeCoins])

  const availableNativeCoins = useMemo(() => {
    return filteredNativeCoins.filter(coin =>
      currentNativeCoins.every(c => !areEqualCoins(c, coin))
    )
  }, [currentNativeCoins, filteredNativeCoins])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate({ id: 'vault' })} />
        }
        secondaryControls={
          <DoneButton onClick={() => navigate({ id: 'vault' })}>
            <Text color="primaryAlt" as="span" size={14} weight={400}>
              {t('done')}
            </Text>
          </DoneButton>
        }
        title={t('manage_chains')}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <ChainSearch value={search} onChange={setSearch} />
        {activeNativeCoins.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('active')}
            </Text>
            <ChainGrid>
              {activeNativeCoins.map((coin, index) => (
                <NativeCoinItem key={index} {...coin} />
              ))}
            </ChainGrid>
          </VStack>
        ) : null}
        {availableNativeCoins.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('available')}
            </Text>
            <ChainGrid>
              {availableNativeCoins.map((coin, index) => (
                <NativeCoinItem key={index} {...coin} />
              ))}
            </ChainGrid>
          </VStack>
        ) : null}
      </PageContent>
    </VStack>
  )
}

const ChainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
`

const ChainCard = styled(UnstyledButton)<{
  $isSelected: boolean
  $isLoading: boolean
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 16px;
  border-radius: 20px;
  background: ${getColor('foreground')};
  border: 2px solid
    ${({ $isSelected }) => ($isSelected ? getColor('primary') : 'transparent')};
  transition: all 0.2s ease;
  opacity: ${({ $isLoading }) => ($isLoading ? 0.5 : 1)};
  cursor: ${({ $isLoading }) => ($isLoading ? 'not-allowed' : 'pointer')};

  &:hover {
    background: ${({ $isLoading }) =>
      $isLoading ? getColor('foreground') : getColor('foregroundDark')};
  }
`

const ChainIconWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CheckBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${getColor('primary')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('contrast')};
  border: 2px solid ${getColor('foreground')};
`

const DoneButton = styled(UnstyledButton)`
  display: flex;
  padding: 6px 12px;
  align-items: center;
  gap: 6px;

  border-radius: 99px;
  background: ${getColor('foreground')};

  transition: background 0.3s ease;

  &:hover {
    background: ${getColor('foregroundDark')};
  }
`
