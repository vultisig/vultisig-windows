import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClockRotateClockwiseIcon } from '@lib/ui/icons/ClockRotateClockwiseIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack } from '@lib/ui/layout/Stack'

import { RefreshVaultBalance } from '../balance/RefreshVaultBalance'

export const VaultPageHeaderControls = () => {
  const navigate = useCoreNavigate()

  return (
    <HStack gap={4} alignItems="center">
      <RefreshVaultBalance />
      {featureFlags.transactionHistory && (
        <IconButton
          onClick={() => navigate({ id: 'transactionHistory' })}
          data-testid="transaction-history-button"
        >
          <IconWrapper size={24}>
            <ClockRotateClockwiseIcon />
          </IconWrapper>
        </IconButton>
      )}
      <IconButton
        onClick={() => navigate({ id: 'settings' })}
        data-testid="settings-button"
      >
        <IconWrapper size={24}>
          <SettingsIcon />
        </IconWrapper>
      </IconButton>
    </HStack>
  )
}
