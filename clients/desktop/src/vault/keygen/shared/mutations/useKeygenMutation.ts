import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { MpcLib } from '@core/mpc/mpcLib'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { useVaultCreationMpcLib } from '../../../../mpc/state/vaultCreationMpcLib'
import { useCurrentKeygenType } from '../../state/currentKeygenType'
import { KeygenResolver } from './KeygenResolver'
import { useDklsKeygen } from './useDklsKeygen'
import { useGg20Keygen } from './useGg20Keygen'

export const useKeygenMutation = () => {
  const keygenType = useCurrentKeygenType()

  const [step, setStep] = useState<KeygenStep | null>(null)

  const keygenVault = useKeygenVault()

  const [vaultCreationMpcLib] = useVaultCreationMpcLib()

  const mpcLib: MpcLib = useMemo(() => {
    if (keygenType === 'migrate') {
      return 'DKLS'
    }

    if ('existingVault' in keygenVault) {
      return keygenVault.existingVault.libType
    }

    return vaultCreationMpcLib
  }, [keygenType, keygenVault, vaultCreationMpcLib])

  const gg20Keygen = useGg20Keygen()
  const dklsKeygen = useDklsKeygen()

  const mutation = useMutation({
    mutationFn: async () => {
      const resolvers: Record<MpcLib, KeygenResolver> = {
        GG20: gg20Keygen,
        DKLS: dklsKeygen,
      }

      const resolver = resolvers[mpcLib]

      return resolver({ onStepChange: setStep })
    },
  })

  return {
    ...mutation,
    step,
  }
}
