import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/vaults/index.scss'

import VultiError from '@clients/extension/src/components/vulti-error'
import VultiLoading from '@clients/extension/src/components/vulti-loading'
import { Vultisig } from '@clients/extension/src/icons'
import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Text } from '@lib/ui/text'
import { Button, Checkbox, Form } from 'antd'
import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useTranslation } from 'react-i18next'

interface FormProps {
  uids: string[]
}

interface InitialState {
  errorDescription?: string
  errorTitle?: string
  hasError?: boolean
  vaults: VaultProps[]
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { vaults: [] }
  const [state, setState] = useState(initialState)
  const { errorDescription, errorTitle, hasError, vaults } = state
  const [form] = Form.useForm()

  const handleClose = () => {
    window.close()
  }

  const handleSubmit = () => {
    form
      .validateFields()
      .then(({ uids }: FormProps) => {
        getStoredVaults().then(vaults => {
          setStoredVaults(
            vaults.map(vault => ({
              ...vault,
              selected: uids.indexOf(vault.uid) >= 0,
            }))
          ).then(() => {
            handleClose()
          })
        })
      })
      .catch(() => {})
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      if (vaults.length) {
        setState(prevState => ({ ...prevState, vaults, hasError: false }))
      } else {
        setState(prevState => ({
          ...prevState,
          errorDescription: t('get_vault_failed_description'),
          errorTitle: t('get_vault_failed'),
          hasError: true,
        }))
      }
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(componentDidMount, [])

  return (
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
            <Text className="title" color="contrast" weight={700}>
              {t('connect_with_vultisig')}
            </Text>
          </div>
          <div className="content">
            <Form form={form} onFinish={handleSubmit}>
              <Form.Item<FormProps>
                name="uids"
                rules={[{ required: true, message: t('select_vault') }]}
              >
                <Checkbox.Group>
                  {vaults.map(({ name, uid }) => (
                    <Checkbox key={uid} value={uid}>
                      <span className="name">{name}</span>
                    </Checkbox>
                  ))}
                </Checkbox.Group>
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
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <Component />
    </AppProviders>
  </StrictMode>
)
