import { MiddleTruncate } from '@clients/extension/src/components/middle-truncate/index'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { Vault } from '@clients/extension/src/utils/interfaces'
import { getStoredVaults } from '@clients/extension/src/utils/storage'
import { getChainEntityIconSrc } from '@core/chain/utils/getChainEntityIconSrc'
import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { Button } from '@lib/ui/buttons/Button'
import { ChainEntityIcon } from '@lib/ui/chain/ChainEntityIcon'
import { Settings } from '@lib/ui/icons/Settings'
import { World } from '@lib/ui/icons/World'
import { Layout } from '@lib/ui/layout'
import { Content } from '@lib/ui/layout/content'
import { Footer } from '@lib/ui/layout/footer'
import { Header } from '@lib/ui/layout/header'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemExtraDevices } from '@lib/ui/list/item/extra/devices'
import { Text } from '@lib/ui/text'
import { pxToRem } from '@lib/utils/pxToRem'
import { FC, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

const ConnectedAppStatus = styled.span<{ connected: boolean }>`
  background-color: ${({ connected, theme }) =>
    theme.colors[connected ? 'alertSuccess' : 'alertInfo'].toHex()};
  border: solid ${pxToRem(4)}
    ${({ theme }) => theme.colors.buttonsDisabled.toHex()};
  border-radius: 50%;
  height: ${pxToRem(16)};
  position: absolute;
  right: ${pxToRem(-4)};
  top: ${pxToRem(-2)};
  width: ${pxToRem(16)};
`

const ConnectedApp = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.buttonsDisabled.toHex()};
  border: solid ${pxToRem(1)} ${({ theme }) => theme.colors.borderLight.toHex()};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: ${pxToRem(36)};
  justify-content: center;
  position: relative;
  width: ${pxToRem(36)};
`

interface InitialState {
  vault?: Vault
}

const Component: FC = () => {
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { vault } = state
  const { colors } = useTheme()
  const navigate = useAppNavigate()

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      setState(prevState => ({
        ...prevState,
        vault: vaults.find(({ active }) => active),
      }))
    })
  }

  useEffect(componentDidMount, [])

  return vault ? (
    <Layout>
      <Header
        addonAfter={
          <>
            <Button kind="outlined" size="s">
              Open Desktop
            </Button>
            <Settings
              height={24}
              onClick={() => navigate('settings')}
              width={24}
            />
          </>
        }
        addonBefore={
          <ConnectedApp>
            <World
              height={20}
              stroke={colors.textExtraLight.toHex()}
              width={20}
            />
            <ConnectedAppStatus connected />
          </ConnectedApp>
        }
      />
      <Content gap={16} flex>
        <List>
          <ListItem
            title={vault.name}
            extra={
              <ListItemExtraDevices
                total={vault.signers?.length}
                secure={
                  !hasServer(vault.signers) || isServer(vault.localPartyId)
                }
              />
            }
          />
        </List>
        <VStack gap={12}>
          <Text weight={500} size={12} color="light">
            Portfolio Overview
          </Text>
          <List>
            {vault.chains.map(({ address, chain }) => (
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
      </Content>
      <Footer></Footer>
    </Layout>
  ) : (
    <></>
  )
}

export default Component
