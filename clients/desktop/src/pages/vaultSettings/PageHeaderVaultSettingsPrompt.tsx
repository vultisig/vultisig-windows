import { MenuIcon } from '../../lib/ui/icons/MenuIcon'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton'

export const PageHeaderVaultSettingsPrompt = () => {
  const navigate = useAppNavigate()

  return (
    <PageHeaderIconButton
      onClick={() => navigate('vaultSettings')}
      icon={<MenuIcon />}
    />
  )
}
