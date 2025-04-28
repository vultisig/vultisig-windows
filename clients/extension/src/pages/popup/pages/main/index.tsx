import { Button } from '@clients/extension/src/components/button'
import { MiddleTruncate } from '@clients/extension/src/components/middle-truncate'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VaultSigners } from '@core/ui/vault/signers'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { LinkTwoIcon } from '@lib/ui/icons/LinkTwoIcon'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { WorldIcon } from '@lib/ui/icons/WorldIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

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
  height: 36px;
  position: relative;
  width: 36px;
`

export const MainPage = () => {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const vault = useCurrentVault()
  const coins = useCurrentVaultCoins()
  const appNavigate = useAppNavigate()
  const navigate = useCoreNavigate()

  return vault ? (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <ConnectedApp ghost>
            <WorldIcon
              height={20}
              stroke={colors.textExtraLight.toHex()}
              width={20}
            />
            <ConnectedAppStatus connected />
          </ConnectedApp>
        }
        secondaryControls={
          <HStack gap={8} alignItems="center">
            <Button shape="round" size="small">
              Open Desktop
            </Button>
            <Button ghost>
              <SettingsIcon
                height={24}
                onClick={() => appNavigate('settings')}
                width={24}
              />
            </Button>
          </HStack>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow fullWidth scrollable>
        <List>
          <ListItem
            extra={<VaultSigners vault={vault} />}
            title={vault.name}
            onClick={() => navigate('vaults')}
            hoverable
          />
        </List>
        <VStack gap={12}>
          <Text weight={500} size={12} color="light">
            Portfolio Overview
          </Text>

          <List>
            {coins.map(({ address, chain }) => (
              <ListItem
                description={
                  address ? (
                    <MiddleTruncate text={address} width={80} />
                  ) : undefined
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
              />
            ))}
          </List>
        </VStack>
      </PageContent>
      <PageFooter fullWidth>
        <Button
          onClick={() => appNavigate('manageChains')}
          shape="round"
          size="large"
          type="primary"
          block
        >
          <LinkTwoIcon height={16} strokeWidth={2} width={16} />
          {t('manage_chains')}
        </Button>
      </PageFooter>
    </VStack>
  ) : (
    <></>
  )
}
