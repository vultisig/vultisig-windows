import { ReactNode } from 'react'

import { ReshareVaultPage } from '../mpc/keygen/reshare/ReshareVaultPage'
import { VaultDefaultChainsPage } from '../preferences/vaultDefaultChains/VaultDefaultChainsPage'
import { ActiveVaultGuard } from '../vault/ActiveVaultGuard'

type SharedPaths = 'reshareVault' | 'defaultChains'

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
  defaultChains: <VaultDefaultChainsPage />,
}
