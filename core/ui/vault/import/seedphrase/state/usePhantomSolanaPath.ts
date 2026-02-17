import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [UsePhantomSolanaPathProvider, useUsePhantomSolanaPath] =
  setupStateProvider<boolean>('UsePhantomSolanaPath')
