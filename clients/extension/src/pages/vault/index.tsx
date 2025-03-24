import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/vaults/index.scss'

import ConfigProvider from '@clients/extension/src/components/config-provider'
import VultiError from '@clients/extension/src/components/vulti-error'
import VultiLoading from '@clients/extension/src/components/vulti-loading'
import { Vultisig } from '@clients/extension/src/icons'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import {
  getStoredRequest,
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Chain } from '@core/chain/Chain'
import { Button, Form, Radio } from 'antd'
import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import { ExtensionProviders } from '../../state/ExtensionProviders'

interface FormProps {
  uid: string
}

interface InitialState {
  chain?: Chain
  errorDescription?: string
  errorTitle?: string
  hasError?: boolean
  sender?: string
  vaults: VaultProps[]
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { vaults: [] }
  const [state, setState] = useState(initialState)
  const { errorDescription, errorTitle, hasError, sender, vaults } = state
  const [form] = Form.useForm()

  const handleClose = () => {
    window.close()
  }

  const handleSubmit = () => {
    form.validateFields().then(({ uid }: FormProps) => {
      if (sender) {
        getStoredVaults().then(vaults => {
          setStoredVaults(
            vaults.map(vault => ({
              ...vault,
              apps:
                uid === vault.uid
                  ? [
                      sender,
                      ...(vault.apps?.filter(app => app !== sender) ?? []),
                    ]
                  : vault.apps,
              active: uid === vault.uid,
            }))
          ).then(() => {
            handleClose()
          })
        })
      }
    })
  }

  const componentDidMount = (): void => {
    getStoredRequest()
      .then(({ sender }) => {
        getStoredVaults().then(vaults => {
          if (vaults.length) {
            setState(prevState => ({
              ...prevState,
              sender,
              vaults,
              hasError: false,
            }))
          } else {
            console.error('Failed to load vaults or request data')
            setState(prevState => ({
              ...prevState,
              errorDescription: t('get_vault_failed_description'),
              errorTitle: t('get_vault_failed'),
              hasError: true,
            }))
          }
        })
      })
      .catch(() => {
        console.error('Failed to load vaults or request data')
        setState(prevState => ({
          ...prevState,
          errorDescription: t('get_vault_failed_description'),
          errorTitle: t('get_vault_failed'),
          hasError: true,
        }))
      })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(componentDidMount, [])

  return (
    <ConfigProvider>
      <div className="layout">
        {hasError ? (
          <VultiError
            onClose={handleClose}
            description={errorDescription ?? ''}
            title={errorTitle ?? ''}
          />
        ) : vaults.length ? (
          <>
            <div className="header">
              <Vultisig className="logo" />
              <span className="title">{t('connect_with_vultisig')}</span>
            </div>
            <div className="content">
              <Form form={form} onFinish={handleSubmit}>
                <Form.Item<FormProps>
                  name="uid"
                  rules={[{ required: true, message: t('select_vault') }]}
                >
                  <Radio.Group>
                    {vaults.map(({ name, uid }) => (
                      <Radio key={uid} value={uid}>
                        <span className="name">{name}</span>
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
                <Button htmlType="submit" />
              </Form>
            </div>
            <div className="footer">
              <Button onClick={handleClose} shape="round" block>
                {t('cancel')}
              </Button>
              <Button onClick={handleSubmit} type="primary" shape="round" block>
                {t('connect')}
              </Button>
            </div>
          </>
        ) : (
          <VultiLoading />
        )}
      </div>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExtensionProviders>
      <Component />
    </ExtensionProviders>
  </StrictMode>
)
