import { OnSuccessProp } from '@lib/ui/props'
import { useMutation } from '@tanstack/react-query'

import { loadMpcEngine } from '../../../bootstrapMpcEngine'
import { useFastKeygenServerAction } from '../state/fastKeygenServerAction'

export const useFastKeygenServerActionMutation = (
  options: Partial<OnSuccessProp> = {}
) => {
  const action = useFastKeygenServerAction()

  return useMutation({
    // The server starts its side of the protocol on this call and then waits
    // for the local party, so the SDK that registers the MPC engine has to be
    // loadable before any fast server action runs.
    mutationFn: async () => {
      await loadMpcEngine()
      await action()
    },
    ...options,
  })
}
