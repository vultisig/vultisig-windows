import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'

export const PageHeaderVaultSettingsPrompt = () => {
  const navigate = useCoreNavigate()

  return (
    <PageHeaderIconButton
      onClick={() => navigate({ id: 'vaultSettings' })}
      icon={<MenuIcon />}
    />
  )
}
