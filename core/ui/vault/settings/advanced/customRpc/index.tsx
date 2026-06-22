import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCustomRpcOverrides } from '@core/ui/storage/customRpcOverrides'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { SearchField } from '@lib/ui/search/SearchField'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { customRpcSupportedChains } from '@vultisig/core-chain/chains/customRpc/customRpcSupportedChains'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const CustomRpcPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const overrides = useCustomRpcOverrides()
  const [search, setSearch] = useState('')

  const chains = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return customRpcSupportedChains
    }

    return customRpcSupportedChains.filter(chain => {
      const coin = chainFeeCoin[chain]

      return (
        chain.toLowerCase().includes(normalized) ||
        coin.ticker.toLowerCase().includes(normalized)
      )
    })
  }, [search])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() => navigate({ id: 'vaultSettingsAdvanced' })}
          />
        }
        title={t('custom_rpc')}
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack gap={16}>
          <Text as="h2" size={22} weight="500">
            {t('select_chain')}
          </Text>
          <SearchField value={search} onSearch={setSearch} />
        </VStack>
        {chains.length ? (
          <ChainGrid>
            {chains.map(chain => {
              const coin = chainFeeCoin[chain]
              const customUrl = overrides[chain]

              return (
                <ChainTile
                  key={chain}
                  onClick={() =>
                    navigate({ id: 'customRpcDetail', state: { chain } })
                  }
                >
                  <ChainIconFrame $isCustom={Boolean(customUrl)}>
                    <ChainEntityIcon
                      value={getChainLogoSrc(chain)}
                      style={{ fontSize: 40 }}
                    />
                    {customUrl && (
                      <EditBadge aria-label={t('custom_rpc_chip_custom')}>
                        <PencilIcon />
                      </EditBadge>
                    )}
                  </ChainIconFrame>
                  <ChainName size={12} weight="500" cropped>
                    {coin.ticker}
                  </ChainName>
                </ChainTile>
              )
            })}
          </ChainGrid>
        ) : (
          <Text color="shy" size={14} centerHorizontally>
            {t('no_chains_found')}
          </Text>
        )}
      </PageContent>
    </VStack>
  )
}

const ChainGrid = styled.div`
  display: grid;
  gap: 24px 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
`

const ChainTile = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: ${getColor('text')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 11px;
  min-width: 0;
  padding: 0;
`

const ChainIconFrame = styled.div<{ $isCustom: boolean }>`
  align-items: center;
  background: ${getColor('foreground')};
  border: 1.5px solid
    ${({ $isCustom }) =>
      $isCustom ? getColor('foregroundSuper') : 'transparent'};
  border-radius: 24px;
  display: flex;
  height: 74px;
  justify-content: center;
  position: relative;
  width: 100%;
`

const EditBadge = styled.div`
  align-items: center;
  background: ${getColor('foregroundSuper')};
  border-bottom-right-radius: 25px;
  border-top-left-radius: 40px;
  bottom: 0;
  color: ${getColor('text')};
  display: flex;
  font-size: 12px;
  height: 24px;
  justify-content: center;
  position: absolute;
  right: 0;
  width: 30px;
`

const ChainName = styled(Text)`
  max-width: 100%;
`
