import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const {
  useState: useUsePhantomSolanaPath,
  provider: UsePhantomSolanaPathProvider,
} = getStateProviderSetup<boolean>('UsePhantomSolanaPath')
