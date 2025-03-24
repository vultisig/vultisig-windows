import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { UpdateVaultOrder } from '../../../wailsjs/go/storage/Store'
import { vaultsQueryKey } from '../queries/useVaultsQuery'

type Input = {
  id: string
  order: number
}

export const useUpdateVaultOrderMutation = () => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: ({ id, order }: Input) => UpdateVaultOrder(id, order),
    onSuccess: () => {
      invalidate(vaultsQueryKey)
    },
  })
}
