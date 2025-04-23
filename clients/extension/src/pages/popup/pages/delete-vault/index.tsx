import { ArrowLeft, TriangleWarning } from '@clients/extension/src/icons'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button, ConfigProvider } from 'antd'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultId } from '../../../../vault/state/currentVaultId'
import { getVaults, useVaultsMutation } from '../../../../vault/state/vaults'

const Component = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const [, setCurrentVaultId] = useCurrentVaultId()
  const currentVault = useCurrentVault()
  const { mutateAsync: updateVaults } = useVaultsMutation()
  const handleSubmit = async (): Promise<void> => {
    const vaults = await getVaults()
    const index = vaults.findIndex(
      v => getVaultId(v) === getVaultId(currentVault)
    )
    if (vaults.length > 1) {
      const updatedVaults = [
        ...vaults.slice(0, index),
        ...vaults.slice(index + 1),
      ]
      await updateVaults(updatedVaults)
      setCurrentVaultId(getVaultId(updatedVaults[0]))
      navigate('main')
    } else {
      await updateVaults([])
      setCurrentVaultId(null)
      navigate('landing')
    }
  }

  return (
    <div className="layout delete-vault-page">
      <div className="header">
        <span className="heading">{t('remove_vault')}</span>
        <ArrowLeft
          className="icon icon-left"
          onClick={() => navigate('settings')}
        />
      </div>
      <div className="content">
        <TriangleWarning className="icon" />
        <span className="text">{`${t('removing_vault_warning')}:`}</span>
        <span className="name">{currentVault?.name}</span>
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
