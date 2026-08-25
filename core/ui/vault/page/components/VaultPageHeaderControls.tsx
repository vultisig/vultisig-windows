import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClockRotateClockwiseIcon } from '@lib/ui/icons/ClockRotateClockwiseIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { StationOutlineSettingsIcon } from '@lib/ui/icons/StationFigmaIcons'
import { HStack } from '@lib/ui/layout/Stack'

import { RefreshVaultBalance } from '../balance/RefreshVaultBalance'

export const VaultPageHeaderControls = () => {
  const navigate = useCoreNavigate()
  const { client } = useCore()
  const isExtension = client === 'extension'

  return (
    <HStack gap={4} alignItems="center">
      {!isExtension && <RefreshVaultBalance />}
      {featureFlags.transactionHistory && (
        <IconButton
          onClick={() => navigate({ id: 'transactionHistory' })}
          data-testid="transaction-history-button"
          size={isExtension ? 'xs' : undefined}
        >
          <IconWrapper size={24}>
            <ClockRotateClockwiseIcon />
          </IconWrapper>
        </IconButton>
      )}
      <IconButton
        onClick={() => navigate({ id: 'settings' })}
        data-testid="settings-button"
        size={isExtension ? 'lg' : undefined}
      >
        <IconWrapper size={24}>
          {isExtension ? <StationOutlineSettingsIcon /> : <SettingsIcon />}
        </IconWrapper>
      </IconButton>
    </HStack>
  )
}
