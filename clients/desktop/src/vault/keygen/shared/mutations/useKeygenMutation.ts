import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { MpcLib } from '@core/mpc/mpcLib'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { useMpcLib } from '../../../../mpc/state/mpcLib'
import { useCurrentKeygenType } from '../../state/currentKeygenType'
import { KeygenResolver } from './KeygenResolver'
import { useDklsKeygen } from './useDklsKeygen'
import { useGg20Keygen } from './useGg20Keygen'

export const useKeygenMutation = () => {
  const keygenType = useCurrentKeygenType()

  const mpcLib = useMpcLib()

  const [step, setStep] = useState<KeygenStep | null>(null)

  const targetMpcLib = keygenType === KeygenType.Migrate ? 'DKLS' : mpcLib

  const gg20Keygen = useGg20Keygen()
  const dklsKeygen = useDklsKeygen()

  const mutation = useMutation({
    mutationFn: async () => {
      const resolvers: Record<MpcLib, KeygenResolver> = {
        GG20: gg20Keygen,
        DKLS: dklsKeygen,
      }

      const resolver = resolvers[targetMpcLib]

      return resolver({ onStepChange: setStep })
    },
  })

  return {
    ...mutation,
    step,
  }
}
