import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'

import { useMnemonic } from '../state/mnemonic'
import { useSelectedChains } from '../state/selectedChains'

export const useFinishSeedphraseImport = () => {
  const navigate = useCoreNavigate()
  const [mnemonic] = useMnemonic()
  const [selectedChains] = useSelectedChains()

  return () => {
    navigate({
      id: 'setupVault',
      state: {
        keyImportInput: {
          mnemonic,
          chains: selectedChains,
        },
      },
    })
  }
}
