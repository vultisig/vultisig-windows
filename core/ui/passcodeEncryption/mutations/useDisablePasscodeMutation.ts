import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { useCore } from '../../state/core'
import { StorageKey } from '../../storage/StorageKey'

export const useDisablePasscodeMutation = () => {
  const { setPasscodeEncryption } = useCore()
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async () => {
      await setPasscodeEncryption(null)
      await invalidateQueries(
        [StorageKey.passcodeEncryption],
        [StorageKey.vaults]
      )
    },
  })
}
