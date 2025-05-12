import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { ChildrenProp } from '@lib/ui/props'
import { FC } from 'react'

import { CurrentVaultFolderPageProvider } from './CurrentVaultFolderPageProvider'

export const WrapWithVaultFolderContext: FC<ChildrenProp> = ({ children }) => {
  return (
    <ActiveVaultGuard>
      <CurrentVaultFolderPageProvider>
        {children}
      </CurrentVaultFolderPageProvider>
    </ActiveVaultGuard>
  )
}
