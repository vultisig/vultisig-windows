import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { useCurrentVaultAppSessionsQuery } from '@core/extension/storage/hooks/appSessions'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { VaultSigners } from '@core/ui/vault/signers'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { LinkTwoIcon } from '@lib/ui/icons/LinkTwoIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { WorldIcon } from '@lib/ui/icons/WorldIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { sum } from '@lib/utils/array/sum'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const ConnectedAppStatus = styled.span<{ connected: boolean }>`
  background-color: ${({ connected }) =>
    getColor(connected ? 'primary' : 'primaryAlt')};
  border: solid 4px ${getColor('buttonBackgroundDisabled')};
  border-radius: 50%;
  height: 16px;
  position: absolute;
  right: -4px;
  top: -2px;
  width: 16px;
`

const ConnectedApp = styled(IconButton)`
  background-color: ${getColor('buttonBackgroundDisabled')};
  border: solid 1px ${getColor('foregroundExtra')};
  border-radius: 50%;
  color: ${getColor('textShy')};
  position: initial;

  &:hover {
    color: ${getColor('text')};
  }
`

export const VaultPage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const navigate = useAppNavigate()
  const { data: sessions = {} } = useCurrentVaultAppSessionsQuery()
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery()
  const addresses = useCurrentVaultAddresses()
  const fiatCurrency = useFiatCurrency()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <ConnectedApp
            onClick={() => navigate({ id: 'connectedDapps' })}
            size="lg"
          >
            <WorldIcon fontSize={20} />
            <ConnectedAppStatus
              connected={Object.values(sessions).length > 0}
            />
          </ConnectedApp>
        }
        secondaryControls={
          <>
            <IconButton onClick={() => navigate({ id: 'uploadQr', state: {} })}>
              <CameraIcon />
            </IconButton>
            <IconButton onClick={() => navigate({ id: 'settings' })}>
              <SettingsIcon />
            </IconButton>
          </>
        }
        title={vault.name}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <List>
          <ListItem
            extra={<VaultSigners vault={vault} />}
            onClick={() => navigate({ id: 'vaults' })}
            title={vault.name}
            hoverable
          />
        </List>
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('portfolio_overview')}
          </Text>

          <List>
            {vaultChainBalances.map(({ chain, coins }) => {
              const address = addresses[chain]
              const assets = coins.length
              const [coin] = coins

              return (
                <ListItem
                  description={<MiddleTruncate text={address} width={160} />}
                  extra={
                    <VStack gap={4} alignItems="end">
                      <Text weight={500} size={14} color="contrast">
                        {formatAmount(
                          sum(
                            coins.map(coin =>
                              getCoinValue({
                                price: coin.price ?? 0,
                                amount: coin.amount,
                                decimals: coin.decimals,
                              })
                            )
                          ),
                          fiatCurrency
                        )}
                      </Text>
                      <Text weight={500} size={12} color="light">
                        {assets > 1
                          ? `${assets} ${t('assets')}`
                          : formatTokenAmount(
                              fromChainAmount(coin.amount, coin.decimals)
                            )}
                      </Text>
                    </VStack>
                  }
                  icon={
                    <ChainEntityIcon
                      value={getChainLogoSrc(chain)}
                      style={{ fontSize: 36 }}
                    />
                  }
                  key={chain}
                  title={chain}
                  hoverable
                  showArrow
                  onClick={() => {
                    navigate({
                      id: 'vaultChainDetail',
                      state: { chain },
                    })
                  }}
                />
              )
            })}
          </List>
        </VStack>
      </PageContent>
      <PageFooter>
        <Button
          icon={<LinkTwoIcon fontSize={16} />}
          onClick={() => navigate({ id: 'manageVaultChains' })}
        >
          {t('manage_chains')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
