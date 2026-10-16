import { RefreshDefiData } from '@core/ui/defi/RefreshDefiData'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack } from '@lib/ui/layout/Stack'

/** The home header's controls while the DeFi tab is showing. */
export const DefiHomeHeaderControls = () => {
  const navigate = useCoreNavigate()
  const { client } = useCore()
  const isExtension = client === 'extension'

  // Sized like `VaultPageHeaderControls` so the controls keep their size and
  // inset when switching between the Wallet and Earn tabs in the popup.
  const controlIconSize = isExtension ? 20 : 24

  return (
    <HStack gap={4} alignItems="center">
      <RefreshDefiData iconSize={controlIconSize} />
      <IconButton
        size={isExtension ? 'md' : 'lg'}
        onClick={() => navigate({ id: 'settings' })}
      >
        <IconWrapper size={controlIconSize}>
          <SettingsIcon />
        </IconWrapper>
      </IconButton>
    </HStack>
  )
}
