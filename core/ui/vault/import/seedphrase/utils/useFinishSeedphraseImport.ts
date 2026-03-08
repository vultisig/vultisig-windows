import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'

import { useMnemonic } from '../state/mnemonic'
import { useMoneroBirthday } from '../state/moneroBirthday'
import { useSelectedChains } from '../state/selectedChains'
import { useUsePhantomSolanaPath } from '../state/usePhantomSolanaPath'
import { useZcashBirthday } from '../state/zcashBirthday'

export const useFinishSeedphraseImport = () => {
  const navigate = useCoreNavigate()
  const [mnemonic] = useMnemonic()
  const [selectedChains] = useSelectedChains()
  const [usePhantomSolanaPath] = useUsePhantomSolanaPath()
  const [zcashBirthday] = useZcashBirthday()
  const [moneroBirthday] = useMoneroBirthday()

  return () => {
    navigate({
      id: 'setupVault',
      state: {
        keyImportInput: {
          mnemonic,
          chains: selectedChains,
          usePhantomSolanaPath,
          zcashBirthday: zcashBirthday ?? undefined,
          moneroBirthday: moneroBirthday ?? undefined,
        },
      },
    })
  }
}
