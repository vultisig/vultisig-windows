import { ArrowLeft } from '@clients/extension/src/icons'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { VaultProps } from '@clients/extension/src/utils/interfaces'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Button, Form, Input } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const Component = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const navigate = useAppNavigate()

  const handleSubmit = (): void => {
    form
      .validateFields()
      .then(({ name }: VaultProps) => {
        getStoredVaults().then(vaults => {
          setStoredVaults(
            vaults.map(item => (item.active ? { ...item, name } : item))
          )
        })
      })
      .catch(() => {})
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      form.setFieldsValue(vault)
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(componentDidMount, [])

  return (
    <div className="layout rename-vault-page">
      <div className="header">
        <span className="heading">{t('rename_vault')}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => navigate('settings')}
        />
      </div>
      <div className="content">
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item<VaultProps> name="name" rules={[{ required: true }]}>
            <Input placeholder={t('name')} />
          </Form.Item>
          <Button htmlType="submit" />
        </Form>
      </div>
      <div className="footer">
        <Button onClick={handleSubmit} type="primary" shape="round" block>
          {t('save')}
        </Button>
      </div>
    </div>
  )
}

export default Component
