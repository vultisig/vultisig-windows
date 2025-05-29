import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { sum } from '@lib/utils/array/sum'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ChainContent,
  ChainItem,
  ChainList,
  Checkbox,
  Container,
  Content,
} from './ChainSelectionScreen.styles'

export const ChainSelectionScreen = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useNavigateBack()
  const [state] = useCoreViewState<'chainSelection'>()
  const [search, setSearch] = useState('')
  const [selectedChain, setSelectedChain] = useState<Chain | null>(
    state?.selectedChain || null
  )
  const fiatCurrency = useFiatCurrency()
  const balancesQuery = useVaultChainsBalancesQuery()

  const chainOptions = useMemo(() => {
    if (!balancesQuery.data) return []
    return balancesQuery.data.map(balance => ({
      value: balance.chain,
      label: balance.chain,
    }))
  }, [balancesQuery.data])

  const filteredChains = useMemo(() => {
    if (!search) return chainOptions

    const normalizedSearch = search.toLowerCase()
    return chainOptions.filter(option =>
      option.value.toLowerCase().includes(normalizedSearch)
    )
  }, [chainOptions, search])

  const handleChainSelect = (chain: Chain) => {
    if (state.onChainSelect) {
      state.onChainSelect(chain)
    }
    setSelectedChain(chain)
    state.onChainSelect(chain)
    navigate({
      id: 'addAddress',
      state: {
        selectedChain: chain,
        headerTitle: t('add_address'),
      },
    })
  }

  const getChainBalance = (chain: Chain) => {
    if (!balancesQuery.data) return null
    const chainBalance = balancesQuery.data.find(b => b.chain === chain)
    if (!chainBalance) return null

    const totalAmount = sum(
      chainBalance.coins.map(coin =>
        getCoinValue({
          price: coin.price ?? 0,
          amount: coin.amount,
          decimals: coin.decimals,
        })
      )
    )

    const singleCoin =
      chainBalance.coins.length === 1 ? chainBalance.coins[0] : null

    return {
      totalAmount,
      singleCoin,
      assets: chainBalance.coins.length,
    }
  }

  return (
    <Container>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={<PageHeaderTitle>{t('select_chains')}</PageHeaderTitle>}
      />
      <Content>
        <TextInput
          placeholder={t('search_field_placeholder')}
          onValueChange={setSearch}
          value={search}
        />
        <Text size={12} weight={500} color="light" style={{ marginTop: 16 }}>
          {t('chains')}
        </Text>
        <ChainList>
          {filteredChains.map(option => {
            const balance = getChainBalance(option.value as Chain)
            const isSelected = selectedChain === option.value
            return (
              <ChainItem
                key={option.value}
                alignItems="center"
                onClick={() => handleChainSelect(option.value as Chain)}
              >
                <ChainContent>
                  <ChainEntityIcon
                    value={getChainLogoSrc(option.value)}
                    style={{ width: 24, height: 24, marginRight: 16 }}
                  />
                  <Text color="contrast" size={14} weight="500">
                    {option.value}
                  </Text>
                </ChainContent>
                <HStack gap={12} alignItems="center">
                  {balance && (
                    <VStack gap={4} alignItems="end">
                      <Text color="contrast" size={14} weight="500">
                        <BalanceVisibilityAware>
                          {formatAmount(balance.totalAmount, fiatCurrency)}
                        </BalanceVisibilityAware>
                      </Text>
                      <Text color="light" size={12} weight="500">
                        {balance.assets > 1
                          ? `${balance.assets} ${t('assets')}`
                          : balance.singleCoin &&
                            formatTokenAmount(
                              fromChainAmount(
                                balance.singleCoin.amount,
                                balance.singleCoin.decimals
                              )
                            )}
                      </Text>
                    </VStack>
                  )}
                  <Checkbox checked={isSelected} />
                </HStack>
              </ChainItem>
            )
          })}
        </ChainList>
      </Content>
    </Container>
  )
}
