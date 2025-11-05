import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { Vault } from '@core/mpc/vault/Vault'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { ZapIcon } from '@lib/ui/icons/ZapIcon'
import { ReactNode } from 'react'

type VaultSecurityTone = {
  tone: 'primary' | 'warning'
  icon: ReactNode
}

export const getVaultSecurityTone = (vault: Vault): VaultSecurityTone => {
  const isFast = hasServer(vault.signers) && !isServer(vault.localPartyId)

  return {
    tone: isFast ? 'warning' : 'primary',
    icon: isFast ? <ZapIcon /> : <ShieldIcon />,
  }
}
