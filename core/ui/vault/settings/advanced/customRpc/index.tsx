import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { matchesChainSearch } from '@core/ui/chain/metadata/matchesChainSearch'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useCustomRpcOverrides } from '@core/ui/storage/customRpcOverrides'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { PenIcon } from '@lib/ui/icons/PenIcon'
import { SearchIcon } from '@lib/ui/icons/SearchIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { customRpcSupportedChains } from '@vultisig/core-chain/chains/customRpc/customRpcSupportedChains'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/** Lists the chains that accept a custom RPC, marking those with an override. */
export const CustomRpcPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const overrides = useCustomRpcOverrides()
  const [search, setSearch] = useState('')

  const normalized = search.trim().toLowerCase()
  const chains = normalized
    ? customRpcSupportedChains.filter(chain => {
        const coin = chainFeeCoin[chain]
        return (
          matchesChainSearch({ chain, query: normalized }) ||
          coin.ticker.toLowerCase().includes(normalized)
        )
      })
    : customRpcSupportedChains

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('custom_rpc')} />
      <PageContent flexGrow scrollable>
        <ContentFrame>
          <VStack gap={16}>
            <SettingsBaselineText as="h2" variant="title2">
              {t('select_chain')}
            </SettingsBaselineText>
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
                          <PenIcon />
                        </EditBadge>
                      )}
                    </ChainIconFrame>
                    <ChainName variant="caption" centerHorizontally>
                      {getChainDisplayName(chain)}
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

const PageContent = styled(SettingsPageContent)`
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
  ${borderRadius.pill};
  box-shadow: inset 0 0 8px rgba(240, 244, 252, 0.03);
  color: ${getColor('textShy')};
  display: flex;
  gap: 8px;
  height: 42px;
  padding: 12px;
  width: 100%;

  svg {
    color: ${getColor('text')};
    flex: none;
    font-size: 16px;
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
  padding: 2px 0 0;

  &::placeholder {
    color: ${getColor('textShy')};
  }
`

/** Four columns capped at the 74 tile; the frame's row overhangs its column by 2 a side. */
const ChainGrid = styled.div`
  display: grid;
  gap: 16px 12px;
  grid-template-columns: repeat(4, minmax(0, 74px));
  justify-content: center;
  margin-inline: -2px;
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
  min-width: 0;
  width: 100%;
`

const ChainIconFrame = styled.div<{ $isCustom: boolean }>`
  align-items: center;
  background: ${getColor('foreground')};
  border: 1.5px solid
    ${({ $isCustom }) =>
      $isCustom ? getColor('foregroundExtra') : 'transparent'};
  ${borderRadius.xl};
  display: flex;
  height: 74px;
  justify-content: center;
  position: relative;
  width: 100%;
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
  width: 28px;

  path {
    stroke-width: 1.67;
  }
`

const ChainName = styled(Text)`
  align-self: center;
  letter-spacing: 0.12px;
  max-width: 100%;
`
