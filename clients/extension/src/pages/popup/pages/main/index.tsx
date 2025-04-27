import { MiddleTruncate } from '@clients/extension/src/components/middle-truncate'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { getChainEntityIconSrc } from '@core/chain/utils/getChainEntityIconSrc'
import { VaultSigners } from '@core/ui/vault/signers'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { ChainEntityIcon } from '@lib/ui/chain/ChainEntityIcon'
import { Settings } from '@lib/ui/icons/Settings'
import { World } from '@lib/ui/icons/World'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled, { useTheme } from 'styled-components'

const ConnectedAppStatus = styled.span<{ connected: boolean }>`
  background-color: ${({ connected }) =>
    getColor(connected ? 'alertSuccess' : 'alertInfo')};
  border: solid 4px ${getColor('buttonDisabled')};
  border-radius: 50%;
  height: 16px;
  position: absolute;
  right: -4px;
  top: -2px;
  width: 16px;
`

const ConnectedApp = styled.div`
  align-items: center;
  background-color: ${getColor('buttonDisabled')};
  border: solid 1px ${getColor('borderLight')};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 36px;
  justify-content: center;
  position: relative;
  width: 36px;
`

const Component: FC = () => {
  const vault = useCurrentVault()
  const { colors } = useTheme()
  const navigate = useAppNavigate()
  const coins = useCurrentVaultCoins()

  return vault ? (
    <VStack alignItems="center" justifyContent="center" fullHeight>
      <PageHeader
        primaryControls={
          <ConnectedApp>
            <World
              height={20}
              stroke={colors.textExtraLight.toHex()}
              width={20}
            />
            <ConnectedAppStatus connected />
          </ConnectedApp>
        }
        secondaryControls={
          <HStack gap={8} alignItems="center">
            <Button kind="outlined" size="s">
              Open Desktop
            </Button>
            <Settings
              height={24}
              onClick={() => navigate('settings')}
              width={24}
            />
          </HStack>
        }
        hasBorder
      />
      <PageContent gap={16} fullWidth scrollable>
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
    </VStack>
  ) : (
    <></>
  )
}

export default Component
