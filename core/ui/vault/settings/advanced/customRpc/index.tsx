import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCustomRpcOverrides } from '@core/ui/storage/customRpcOverrides'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent as BasePageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Chain } from '@vultisig/core-chain/Chain'
import { customRpcSupportedChains } from '@vultisig/core-chain/chains/customRpc/customRpcSupportedChains'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const chainNameOverrides: Partial<Record<Chain, string>> = {
  [Chain.BSC]: 'BSC',
  [Chain.CronosChain]: 'Cronos Chain',
  [Chain.Dydx]: 'dYdX',
  [Chain.TerraClassic]: 'Terra Classic',
  [Chain.Zksync]: 'ZKsync',
}

export const getCustomRpcChainName = (chain: Chain) =>
  chainNameOverrides[chain] ?? chain

export const CustomRpcPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const overrides = useCustomRpcOverrides()
  const [search, setSearch] = useState('')

  const normalized = search.trim().toLowerCase()
  const chains = normalized
    ? customRpcSupportedChains.filter(chain => {
        const coin = chainFeeCoin[chain]
        const displayName = getCustomRpcChainName(chain)

        return (
          displayName.toLowerCase().includes(normalized) ||
          coin.ticker.toLowerCase().includes(normalized)
        )
      })
    : customRpcSupportedChains

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
      <PageContent flexGrow scrollable>
        <ContentFrame>
          <VStack gap={16}>
            <Text as="h2" size={22} weight="500">
              {t('select_chain')}
            </Text>
            <SearchInput
              value={search}
              onChange={event => setSearch(event.currentTarget.value)}
              placeholder={t('search_field_placeholder')}
            />
          </VStack>
          {chains.length ? (
            <ChainGrid>
              {chains.map(chain => {
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
                    <ChainName variant="caption" centerHorizontally nowrap>
                      {getCustomRpcChainName(chain)}
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
        </ContentFrame>
      </PageContent>
    </VStack>
  )
}

const PageContent = styled(BasePageContent)`
  align-items: center;
`

const ContentFrame = styled(VStack)`
  gap: 24px;
  width: min(100%, 343px);
`

type SearchInputProps = {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}

const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => (
  <SearchWrapper>
    <SearchIcon />
    <StyledSearchInput
      autoComplete="off"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  </SearchWrapper>
)

const SearchWrapper = styled.div`
  align-items: center;
  background: ${getColor('foreground')};
  border-radius: 99px;
  box-shadow: inset 0 0 8px rgba(240, 244, 252, 0.03);
  color: ${getColor('textShy')};
  display: flex;
  gap: 8px;
  height: 42px;
  padding: 12px;
  width: 100%;

  svg {
    flex: none;
    font-size: 16px;
    stroke-width: 2.5px;
  }
`

const StyledSearchInput = styled.input`
  background: transparent;
  border: 0;
  color: ${getColor('text')};
  flex: 1;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06px;
  line-height: 18px;
  min-width: 0;
  outline: 0;

  &::placeholder {
    color: ${getColor('textShy')};
  }
`

const ChainGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, 74px);
  width: 344px;
  max-width: calc(100vw - 32px);
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
  padding: 0;
  width: 74px;
`

const ChainIconFrame = styled.div<{ $isCustom: boolean }>`
  align-items: center;
  background: ${getColor('foreground')};
  border: 1.5px solid
    ${({ $isCustom }) =>
      $isCustom ? getColor('foregroundExtra') : 'transparent'};
  border-radius: 24px;
  display: flex;
  height: 74px;
  justify-content: center;
  position: relative;
  width: 74px;
`

const EditBadge = styled.div`
  align-items: center;
  background: ${getColor('foregroundExtra')};
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
  align-self: center;
  letter-spacing: 0.12px;
  max-width: 88px;
`
