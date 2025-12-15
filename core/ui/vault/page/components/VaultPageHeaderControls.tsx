import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack } from '@lib/ui/layout/Stack'

import { RefreshVaultBalance } from '../balance/RefreshVaultBalance'

export const VaultPageHeaderControls = () => {
  const navigate = useCoreNavigate()

  return (
    <HStack gap={4} alignItems="center">
      <RefreshVaultBalance />
      <IconButton onClick={() => navigate({ id: 'settings' })}>
        <IconWrapper size={24}>
          <SettingsIcon />
        </IconWrapper>
      </IconButton>
    </HStack>
  )
}
