import {
  Button,
  Content,
  Footer,
  Header,
  Layout,
  List,
} from '@clients/extension/src/components/ui'
import useGoBack from '@clients/extension/src/hooks/go-back'
import { ArrowLeft, ArrowRight } from '@clients/extension/src/icons'
import { appPaths } from '@clients/extension/src/navigation'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { rem } from '@clients/extension/src/utils/functions'
import { borderLight, buttonDisabled } from '@clients/extension/src/colors'

const StyledActiveVault = styled.div`
  border: solid ${rem(1)} ${borderLight};
  border-radius: ${rem(12)};
  display: flex;
  gap: ${rem(12)};
  padding: ${rem(16)} ${rem(20)};
  position: relative;

  &:before {
    background-color: ${buttonDisabled};
    bottom: 0;
    content: '';
    left: 0;
    opacity: 0.5;
    position: absolute;
    right: 0;
    top: 0;
  }
`

interface InitialState {
  vault?: VaultProps
  vaults: VaultProps[]
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { vaults: [] }
  const [state, setState] = useState(initialState)
  const { vault, vaults } = state
  const navigate = useNavigate()
  const goBack = useGoBack()

  const handleSelect = (uid: string) => {
    setStoredVaults(
      vaults.map(vault => ({ ...vault, active: vault.uid === uid }))
    ).then(() => {
      goBack(appPaths.main)
    })
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      setState(prevState => ({ ...prevState, vault, vaults }))
    })
  }

  useEffect(componentDidMount, [])

  return vault ? (
    <Layout>
      <Header
        heading={t('choose_vault')}
        addonBefore={
          <Button onClick={() => goBack(appPaths.main)} ghost>
            <ArrowLeft />
          </Button>
        }
      />
      <Content style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {vault && (
          <StyledActiveVault>
            <span className="name">{vault.name}</span>
            <span className="status">{t('active')}</span>
          </StyledActiveVault>
        )}
        {vaults.length > 1 && (
          <List heading={t('other_vaults')}>
            {vaults
              .filter(({ uid }) => uid !== vault.uid)
              .map(({ name, uid }) => (
                <button
                  key={uid}
                  onClick={() => handleSelect(uid)}
                  className="list-item"
                >
                  <span className="label">{name}</span>
                  <ArrowRight className="action" />
                </button>
              ))}
          </List>
        )}
      </Content>
      <Footer>
        <Button
          onClick={() => navigate(appPaths.import)}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('add_new_vault')}
        </Button>
      </Footer>
    </Layout>
  ) : (
    <></>
  )
}

export default Component
