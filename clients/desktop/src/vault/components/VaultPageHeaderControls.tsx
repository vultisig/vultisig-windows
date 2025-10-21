import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack } from '@lib/ui/layout/Stack'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { RefreshVaultBalance } from '../balance/RefreshVaultBalance'

export const VaultPageHeaderControls = () => {
  const navigate = useAppNavigate()

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
