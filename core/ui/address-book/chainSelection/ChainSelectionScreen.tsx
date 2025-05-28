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
import styled from 'styled-components'

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`

const ChainList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  background-color: #061b3a;
  border-radius: 12px;
`

const ChainItem = styled(HStack)`
  cursor: pointer;
  height: 60px;
  min-height: 58px;
  padding: 12px 20px;
  gap: 16px;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  border-bottom-width: 1px;
  border-bottom-color: #11284a;
  transition: background-color 0.2s;
  background-color: #061b3a;
  justify-content: space-between;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`

const ChainContent = styled(HStack)`
  gap: 16px;
  align-items: center;
`

const Checkbox = styled.div<{ checked?: boolean }>`
  width: 20px;
  height: 20px;
  border: 1px solid ${props => (props.checked ? '#4CAF50' : '#11284A')};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #061b3a;

  &:after {
    content: '';
    width: 6px;
    height: 10px;
    border: 2px solid #4caf50;
    border-top: 0;
    border-left: 0;
    transform: rotate(45deg) translate(-1px, -1px);
    display: ${props => (props.checked ? 'block' : 'none')};
  }
`

export const ChainSelectionScreen = () => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const navigate = useNavigate()
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
    setSelectedChain(chain)
    state.onChainSelect(chain)
    navigate({
      id: 'addAddress',
      state: { selectedChain: chain },
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
