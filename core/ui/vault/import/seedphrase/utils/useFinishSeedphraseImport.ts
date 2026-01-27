import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'

import { useMnemonic } from '../state/mnemonic'
import { useSelectedChains } from '../state/selectedChains'
import { useUsePhantomSolanaPath } from '../state/usePhantomSolanaPath'

export const useFinishSeedphraseImport = () => {
  const navigate = useCoreNavigate()
  const [mnemonic] = useMnemonic()
  const [selectedChains] = useSelectedChains()
  const [usePhantomSolanaPath] = useUsePhantomSolanaPath()

  return () => {
    navigate({
      id: 'setupVault',
      state: {
        keyImportInput: {
          mnemonic,
          chains: selectedChains,
          usePhantomSolanaPath,
        },
      },
    })
  }
}
