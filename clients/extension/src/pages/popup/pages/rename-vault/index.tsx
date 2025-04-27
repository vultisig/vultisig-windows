import { ArrowLeft } from '@clients/extension/src/icons'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { Vault } from '@clients/extension/src/utils/interfaces'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { Button, Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultId } from '../../../../vault/state/currentVaultId'

const Component = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const navigate = useAppNavigate()
  const [currentVaultId] = useCurrentVaultId()
  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  const handleSubmit = (): void => {
    if (currentVaultId)
      form
        .validateFields()
        .then(({ name }: Vault) => {
          updateVault({
            vaultId: currentVaultId,
            fields: {
              name: name,
            },
          }).then(() => [navigate('settings')])
        })
        .catch(error => {
          console.error('Form validation failed:', error)
        })
  }
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
          <Form.Item<Vault> name="name" rules={[{ required: true }]}>
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
