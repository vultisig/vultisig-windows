import { MiddleTruncate } from '@clients/extension/src/components/middle-truncate/index'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import { getStoredVaults } from '@clients/extension/src/utils/storage'
import { Button } from '@lib/ui/buttons/Button'
import { Settings } from '@lib/ui/icons/Settings'
import { VStack } from '@lib/ui/layout/Stack'
import { Layout } from '@lib/ui/layout'
import { Content } from '@lib/ui/layout/content'
import { Header } from '@lib/ui/layout/header'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemExtraDevices } from '@lib/ui/list/item/extra/devices'
import { Text } from '@lib/ui/text'
import { pxToRem } from '@lib/utils/pxToRem'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledIcon = styled.img`
  border-radius: 50%;
  height: ${pxToRem(36)};
  width: ${pxToRem(36)};
`

interface InitialState {
  vault?: VaultProps
}

const Component: FC = () => {
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { vault } = state
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
      />
      <Content gap={20} flex>
        <List>
          <ListItem
            title={vault.name}
            extra={<ListItemExtraDevices total={3} secure />}
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
                icon={
                  <StyledIcon
                    src={`/chains/${chain.toLowerCase()}.svg`}
                    alt={chain}
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
    </Layout>
  ) : (
    <></>
  )
}

export default Component
