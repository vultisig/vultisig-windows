import useGoBack from '@clients/extension/src/hooks/go-back'
import { ArrowLeft, TriangleWarning } from '@clients/extension/src/icons'
import { appPaths } from '@clients/extension/src/navigation'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import type { VaultProps } from '@clients/extension/src/utils/interfaces'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Button, ConfigProvider } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  vault?: VaultProps
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { vault } = state
  const navigate = useAppNavigate()
  const goBack = useGoBack()

  const handleSubmit = (): void => {
    getStoredVaults().then(vaults => {
      const modifiedVaults = vaults.filter(({ active }) => !active)

      if (modifiedVaults.length) {
        setStoredVaults(
          modifiedVaults.map((vault, index) =>
            index === 0 ? { ...vault, active: true } : vault
          )
        )

        navigate('main', { replace: true })
      } else {
        setStoredVaults([])

        navigate('landing', { replace: true })
      }
    })
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      setState(prevState => ({ ...prevState, vault }))
    })
  }

  useEffect(componentDidMount, [])

  return (
    <div className="layout delete-vault-page">
      <div className="header">
        <span className="heading">{t('remove_vault')}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => goBack(appPaths.settings.root)}
        />
      </div>
      <div className="content">
        <TriangleWarning className="icon" />
        <span className="text">{`${t('removing_vault_warning')}:`}</span>
        <span className="name">{vault?.name}</span>
      </div>
      <div className="footer">
        {/* TODO: Deprecate Ant Design and start using styled-components instead to be consistent with the desktop client. All the base components should be in @lib/ui. If you need a new compnent, first check in the desktop client if it's not already created, move it to the @lib/ui and reuse it. */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#f7961b',
            },
          }}
        >
          <Button onClick={handleSubmit} type="primary" shape="round" block>
            {t('remove_vault')}
          </Button>
        </ConfigProvider>
      </div>
    </div>
  )
}

export default Component
