import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { useCore } from '../../../state/core'
import { PasscodeAutoLockValue } from '../../../storage/passcodeAutoLock'
import { StorageKey } from '../../../storage/StorageKey'

export const useSetPasscodeAutoLockMutation = () => {
  const { setPasscodeAutoLock } = useCore()
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async (value: PasscodeAutoLockValue) => {
      await setPasscodeAutoLock(value)
      await invalidateQueries([StorageKey.passcodeAutoLock])
    },
  })
}
