import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useDefiPortfolioBalance } from '@core/ui/defi/page/hooks/useDefiPortfolios'
import { RefreshDefiData } from '@core/ui/defi/RefreshDefiData'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { VaultPageHeaderShell } from '@core/ui/vault/page/components/VaultPageHeaderShell'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'

type DefiPageHeaderProps = {
  vault: Vault
  scrollContainerRef: RefObject<HTMLElement>
}

/**
 * Earn tab header: the same shell as the Wallet tab, with the DeFi total in
 * its collapsed row and refresh and settings as its controls.
 */
export const DefiPageHeader = ({
  vault,
  scrollContainerRef,
}: DefiPageHeaderProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { client } = useCore()
  const isExtension = client === 'extension'

  const { data: totalBalance = 0 } = useDefiPortfolioBalance()
  const formatFiatAmount = useFormatFiatAmount()

  // Sized like `VaultPageHeaderControls` so the controls keep their size and
  // inset when switching between the Wallet and Earn tabs in the popup.
  const controlIconSize = isExtension ? 20 : 24

  return (
    <VaultPageHeaderShell
      vault={vault}
      scrollContainerRef={scrollContainerRef}
      secondaryControls={
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
      }
      balanceLabel={t('defi')}
      balance={formatFiatAmount(totalBalance)}
      testId="defi-page-header"
    />
  )
}
