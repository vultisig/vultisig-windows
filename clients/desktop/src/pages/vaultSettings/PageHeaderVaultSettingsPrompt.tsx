import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'

export const PageHeaderVaultSettingsPrompt = () => {
  const navigate = useAppNavigate()

  return (
    <PageHeaderIconButton
      onClick={() => navigate('vaultSettings')}
      icon={<MenuIcon />}
    />
  )
}
