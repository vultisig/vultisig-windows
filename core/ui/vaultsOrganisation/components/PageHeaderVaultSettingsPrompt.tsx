import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { useCoreNavigate } from '../../navigation/hooks/useCoreNavigate'

export const PageHeaderVaultSettingsPrompt = () => {
  const navigate = useCoreNavigate()

  return (
    <PageHeaderIconButton
      onClick={() => navigate('vaultSettings')}
      icon={<MenuIcon />}
    />
  )
}
