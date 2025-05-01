import { ReactNode } from 'react'

import { ReshareVaultPage } from '../mpc/keygen/reshare/ReshareVaultPage'
import { ActiveVaultGuard } from '../vault/ActiveVaultGuard'
import { VaultDefaultChainsPage } from '../vault/settings/vaultDefaultChains/VaultDefaultChainsPage'

type SharedPaths = 'reshareVault' | 'defaultChains'

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
  defaultChains: <VaultDefaultChainsPage />,
}
