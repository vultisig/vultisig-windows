import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { VStack } from '@lib/ui/layout/Stack'
import { without } from '@lib/utils/array/without'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDefaultChains } from '../../../chain/state/defaultChains'
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc'
import { useCurrentSearch } from '../../../lib/ui/search/CurrentSearchProvider'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { PageSlice } from '../../../ui/page/PageSlice'
import { CoinSearch } from '../../../vault/chain/manage/coin/search/CoinSearch'
import {
  ChainButton,
  Check,
  ColumnOneBothRowsItem,
  ColumnTwoRowOneItem,
  ColumnTwoRowTwoItem,
  HeaderWrapper,
} from './VaultDefaultChains.styles'

const VaultDefaultChains = () => {
  const { t } = useTranslation()
  const [searchQuery] = useCurrentSearch()

  const [value, setValue] = useDefaultChains()

  const nativeTokens = Object.values(chainFeeCoin)
  const filteredNativeTokens = useMemo(() => {
    if (!searchQuery) {
      return nativeTokens
    }
    return nativeTokens.filter(token =>
      token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [nativeTokens, searchQuery])

  return (
    <VStack flexGrow gap={16}>
      <HeaderWrapper>
        <PageHeader
          primaryControls={<PageHeaderBackButton />}
          title={
            <PageHeaderTitle>
              {t('vault_settings_default_chains')}
            </PageHeaderTitle>
          }
        />
      </HeaderWrapper>
      <PageSlice gap={16} flexGrow={true}>
        <CoinSearch />
        {filteredNativeTokens.map(({ ticker, chain }, index) => {
          const imgSrc = getChainEntityIconSrc(chain as string)

          const isSelected = value.includes(chain)

          return (
            <ChainButton
              key={index}
              onClick={() =>
                setValue(prev =>
                  prev.includes(chain) ? without(prev, chain) : [...prev, chain]
                )
              }
            >
              <ColumnOneBothRowsItem
                src={imgSrc}
                alt={ticker}
                width={24}
                height={24}
              />
              <ColumnTwoRowOneItem size={16} color="contrast" weight="600">
                {ticker}
              </ColumnTwoRowOneItem>
              <ColumnTwoRowTwoItem size={12} color="contrast" weight="500">
                {chain}
              </ColumnTwoRowTwoItem>
              <Check value={isSelected} />
            </ChainButton>
          )
        })}
      </PageSlice>
    </VStack>
  )
}

export default VaultDefaultChains
