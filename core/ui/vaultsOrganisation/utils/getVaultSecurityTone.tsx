import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { ZapIcon } from '@lib/ui/icons/ZapIcon'
import { hasServer, isServer } from '@vultisig/core-mpc/devices/localPartyId'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
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
