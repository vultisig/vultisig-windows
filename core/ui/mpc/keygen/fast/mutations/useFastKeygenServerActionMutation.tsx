import { OnSuccessProp } from '@lib/ui/props'
import { useMutation } from '@tanstack/react-query'

import { useFastKeygenServerAction } from '../state/fastKeygenServerAction'

export const useFastKeygenServerActionMutation = (
  options: Partial<OnSuccessProp> = {}
) => {
  const action = useFastKeygenServerAction()

  return useMutation({
    mutationFn: action,
    ...options,
  })
}
