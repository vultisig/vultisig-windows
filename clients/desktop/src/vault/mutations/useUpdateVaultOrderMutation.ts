import { vaultsQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { UpdateVault } from '../../../wailsjs/go/storage/Store'

type Input = {
  id: string
  order: number
}

export const useUpdateVaultOrderMutation = () => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: ({ id, order }: Input) => UpdateVault(id, { order }),
    onSuccess: () => {
      invalidate(vaultsQueryKey)
    },
  })
}
