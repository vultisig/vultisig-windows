import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const NativeCoinItem: FC<{
  chain: Chain
  checked?: boolean
  onChange: () => void
  ticker: string
}> = ({ chain, checked, onChange, ticker }) => {
  return (
    <ListItem
      extra={<Switch onChange={onChange} checked={checked} />}
      icon={
        <ChainEntityIcon
          value={getChainEntityIconSrc(chain)}
          style={{ fontSize: 32 }}
        />
      }
      title={
        <HStack gap={12} alignItems="center">
          <Text color="contrast" size={14} weight={500}>
            {ticker}
          </Text>
          <ListItemTag title={chain} />
        </HStack>
      }
    />
  )
}

export const ManageChainsPage = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState<string | undefined>(undefined)
  const nativeCoins = Object.values(chainFeeCoin)
  const currentNativeCoins = useCurrentVaultNativeCoins()

  const handleSwitch = (_coin: Coin, _isSelected?: boolean) => {
    // TODO: add functionality to add/remove native coins from the vault
  }

  const filteredNativeCoins = useMemo(() => {
    if (!search) return nativeCoins

    return nativeCoins.filter(
      ({ chain, ticker }) =>
        chain.toLowerCase().includes(search) ||
        ticker.toLowerCase().includes(search)
    )
  }, [nativeCoins, search])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('manage_chains')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <TextInput
          placeholder={t('search_field_placeholder')}
          onValueChange={setSearch}
          value={search}
        />
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('active')}
          </Text>
          <List>
            {filteredNativeCoins
              .filter(coin =>
                currentNativeCoins.some(({ chain }) => chain === coin.chain)
              )
              .map(coin => (
                <NativeCoinItem
                  chain={coin.chain}
                  key={`${coin.chain}-${coin.ticker}`}
                  onChange={() => handleSwitch(coin, true)}
                  ticker={coin.ticker}
                  checked
                />
              ))}
          </List>
        </VStack>
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('available')}
          </Text>
          <List>
            {filteredNativeCoins
              .filter(coin =>
                currentNativeCoins.every(({ chain }) => chain !== coin.chain)
              )
              .map(coin => (
                <NativeCoinItem
                  chain={coin.chain}
                  key={`${coin.chain}-${coin.ticker}`}
                  onChange={() => handleSwitch(coin)}
                  ticker={coin.ticker}
                />
              ))}
          </List>
        </VStack>
      </PageContent>
    </VStack>
  )
}
