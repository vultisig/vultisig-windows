import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { ReactNode } from 'react'

import { VaultSelector } from '../page/components/VaultSelector'

type VaultHeaderProps = {
  primaryControls?: ReactNode
  secondaryControls?: ReactNode
}

export const VaultHeader = ({
  primaryControls,
  secondaryControls,
}: VaultHeaderProps) => {
  const vault = useCurrentVault()

  return (
    <PageHeader
      hasBorder
      primaryControls={primaryControls}
      title={<VaultSelector value={vault} />}
      secondaryControls={secondaryControls}
    />
  )
}
