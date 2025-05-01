import { ReactNode } from 'react'

import { ReshareVaultPage } from '../mpc/keygen/reshare/ReshareVaultPage'
import { ActiveVaultGuard } from '../vault/ActiveVaultGuard'

type SharedPaths = 'reshareVault'

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
}
