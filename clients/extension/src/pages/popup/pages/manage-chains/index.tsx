import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  search?: string
}

export const ManageChainsPage = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { search } = state
  const navigate = useAppNavigate()
  const coins = Object.values(chainFeeCoin)

  const handleFilter = (coin: Coin) => {
    const str = search?.toLowerCase()

    return (
      !str ||
      coin.chain.toLowerCase().includes(str) ||
      coin.ticker.toLowerCase().includes(str)
    )
  }

  const handleSearch = (search: string) => {
    setState(prevState => ({ ...prevState, search }))
  }

  const handleSwitch = (coin: Coin) => {
    console.log(coin)
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <Button onClick={() => navigate('root')} ghost>
            <ChevronLeftIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('manage_chains')}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow fullWidth scrollable>
        {/* TODO: Update search input styles based on Figma */}
        <TextInput
          placeholder={t('search_field_placeholder')}
          onValueChange={handleSearch}
          value={search}
        />
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('active')}
          </Text>
          <List>
            {coins.filter(handleFilter).map(coin => (
              <ListItem
                extra={<Switch onChange={() => handleSwitch(coin)} checked />}
                key={`${coin.chain}-${coin.ticker}`}
                icon={
                  <ChainEntityIcon
                    value={getChainEntityIconSrc(coin.chain)}
                    style={{ fontSize: 32 }}
                  />
                }
                title={
                  <HStack gap={12} alignItems="center">
                    <Text color="contrast" size={14} weight={500}>
                      {coin.ticker}
                    </Text>
                    <ListItemTag title={coin.chain} />
                  </HStack>
                }
              />
            ))}
          </List>
        </VStack>
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('available')}
          </Text>
          <List>
            {coins.filter(handleFilter).map(coin => (
              <ListItem
                extra={<Switch onChange={() => handleSwitch(coin)} />}
                key={`${coin.chain}-${coin.ticker}`}
                icon={
                  <ChainEntityIcon
                    value={getChainEntityIconSrc(coin.chain)}
                    style={{ fontSize: 32 }}
                  />
                }
                title={
                  <HStack gap={12} alignItems="center">
                    <Text color="contrast" size={14} weight={500}>
                      {coin.ticker}
                    </Text>
                    <ListItemTag title={coin.chain} />
                  </HStack>
                }
              />
            ))}
          </List>
        </VStack>
      </PageContent>
    </VStack>
  )
}
