import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { ChainItem } from './ChainItem'
import { ChainSearch } from './ChainSearch'

export const ManageVaultChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const nativeCoins = Object.values(chainFeeCoin)
  const navigate = useCoreNavigate()

  const sortedNativeCoins = useMemo(() => {
    let coins = nativeCoins

    if (search) {
      const normalizedSearch = search.toLowerCase()
      coins = nativeCoins.filter(
        ({ chain, ticker }) =>
          chain.toLowerCase().includes(normalizedSearch) ||
          ticker.toLowerCase().includes(normalizedSearch)
      )
    }

    return coins.sort((a, b) => a.chain.localeCompare(b.chain))
  }, [nativeCoins, search])

  console.log(
    '🚀 ~ ManageVaultChainsPage ~ sortedNativeCoins:',
    sortedNativeCoins
  )
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
        {sortedNativeCoins.length > 0 ? (
          <ChainGrid>
            {sortedNativeCoins.map((coin, index) => (
              <ChainItem key={index} value={coin} />
            ))}
          </ChainGrid>
        ) : (
          <EmptyWrapper>
            <VStack gap={12} alignItems="center">
              <IconWrapper size={24} color="buttonHover">
                <CryptoIcon />
              </IconWrapper>
              <VStack gap={8}>
                <Text centerHorizontally size={15}>
                  {t('no_chains_found')}
                </Text>
              </VStack>
            </VStack>
          </EmptyWrapper>
        )}
      </PageContent>
    </VStack>
  )
}

const ChainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(74px, 1fr));
  gap: 16px;
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

const EmptyWrapper = styled.div`
  ${vStack({
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  })};
  padding: 32px 40px;
  border-radius: 16px;
  background: ${getColor('foreground')};
`
