import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { ReactNode } from 'react'

import { VaultSelector } from '../page/components/VaultSelector'

type VaultHeaderProps = {
  primaryControls?: ReactNode
  showRefresh?: boolean
  refreshButton?: ReactNode
}

export const VaultHeader = ({
  primaryControls,
  showRefresh,
  refreshButton,
}: VaultHeaderProps) => {
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()

  return (
    <PageHeader
      hasBorder
      primaryControls={primaryControls}
      title={<VaultSelector value={vault} />}
      secondaryControls={
        <HStack gap={4} alignItems="center">
          {showRefresh && refreshButton}
          <IconButton onClick={() => navigate({ id: 'settings' })}>
            <IconWrapper size={24}>
              <SettingsIcon />
            </IconWrapper>
          </IconButton>
        </HStack>
      }
    />
  )
}
