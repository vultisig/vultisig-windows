import { Button } from '@clients/extension/src/components/button'
import { MiddleTruncate } from '@clients/extension/src/components/middle-truncate'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCurrentVaultAppSessionsQuery } from '@clients/extension/src/sessions/state/useAppSessions'
import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VaultSigners } from '@core/ui/vault/signers'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const ConnectedAppStatus = styled.span<{ connected: boolean }>`
  background-color: ${({ connected }) =>
    getColor(connected ? 'alertSuccess' : 'alertInfo')};
  border: solid 4px ${getColor('buttonBackgroundDisabled')};
  border-radius: 50%;
  height: 16px;
  position: absolute;
  right: -4px;
  top: -2px;
  width: 16px;
`

const ConnectedApp = styled(Button)`
  background-color: ${getColor('buttonBackgroundDisabled')};
  border: solid 1px ${getColor('borderLight')};
  border-radius: 50%;
  color: ${getColor('textExtraLight')};
  position: relative;

  &:hover {
    color: ${getColor('textPrimary')};
  }
`

export const VaultPage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const appNavigate = useAppNavigate()
  const navigate = useCoreNavigate()
  const coins = useCurrentVaultNativeCoins()
  const { data: sessions = {} } = useCurrentVaultAppSessionsQuery()
  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <ConnectedApp
            onClick={() => appNavigate('connectedDapps')}
            size="md"
            fitContent
          >
            <WorldIcon fontSize={20} />
            <ConnectedAppStatus
              connected={Object.values(sessions).length > 0}
            />
          </ConnectedApp>
        }
        secondaryControls={
          <Button
            icon={<SettingsIcon fontSize={20} />}
            onClick={() => appNavigate('settings')}
            size="sm"
            fitContent
          />
        }
        title={
          <Text
            color="contrast"
            size={18}
            style={{ maxWidth: '50%' }}
            weight={500}
            cropped
          >
            {vault.name}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <List>
          <ListItem
            extra={<VaultSigners vault={vault} />}
            onClick={() => navigate('vaults')}
            title={vault.name}
            hoverable
          />
        </List>
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('portfolio_overview')}
          </Text>

          <List>
            {coins.map(({ address, chain }) => (
              <ListItem
                description={
                  address && <MiddleTruncate text={address} width={80} />
                }
                extra={
                  <VStack gap={4} alignItems="end">
                    <Text weight={500} size={14} color="contrast">
                      $1,801.15
                    </Text>
                    <Text weight={500} size={12} color="light">
                      2 assets
                    </Text>
                  </VStack>
                }
                icon={
                  <ChainEntityIcon
                    value={getChainEntityIconSrc(chain)}
                    style={{ fontSize: 36 }}
                  />
                }
                key={chain}
                title={chain}
                hoverable
                showArrow
                onClick={() => {
                  navigate('vaultChainDetail', {
                    params: { chain: chain as Chain },
                  })
                }}
              />
            ))}
          </List>
        </VStack>
      </PageContent>
      <PageFooter>
        <Button
          icon={<LinkTwoIcon fontSize={16} strokeWidth={2} />}
          onClick={() => navigate('manageVaultChains')}
          type="primary"
          block
          rounded
        >
          {t('manage_chains')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
