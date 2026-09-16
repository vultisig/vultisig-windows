import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ClockRotateClockwiseIcon } from '@lib/ui/icons/ClockRotateClockwiseIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack } from '@lib/ui/layout/Stack'

import { RefreshVaultBalance } from '../balance/RefreshVaultBalance'

export const VaultPageHeaderControls = () => {
  const navigate = useCoreNavigate()
  const { client } = useCore()
  const isExtension = client === 'extension'

  // `IconButton` is `width: auto` over a `min-width` floor, so an icon wider
  // than its box grows the button past the size asked for. In the popup that
  // extra width comes straight out of the header's right inset, so size the
  // glyph from the box rather than pinning it.
  const controlSize = isExtension ? 'md' : undefined
  const controlIconSize = isExtension ? 20 : 24

  return (
    <HStack gap={4} alignItems="center">
      {!isExtension && <RefreshVaultBalance />}
      {featureFlags.transactionHistory && (
        <IconButton
          onClick={() => navigate({ id: 'transactionHistory' })}
          data-testid="transaction-history-button"
          size={controlSize}
        >
          <IconWrapper size={controlIconSize}>
            <ClockRotateClockwiseIcon />
          </IconWrapper>
        </IconButton>
      )}
      <IconButton
        onClick={() => navigate({ id: 'settings' })}
        data-testid="settings-button"
        size={controlSize}
      >
        <IconWrapper size={controlIconSize}>
          <SettingsIcon />
        </IconWrapper>
      </IconButton>
    </HStack>
  )
}
