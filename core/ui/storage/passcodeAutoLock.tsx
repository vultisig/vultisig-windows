import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export type PasscodeAutoLockTime = 1 | 5 | 10 | 15 | 30

export type PasscodeAutoLockValue = PasscodeAutoLockTime | null

export const initialPasscodeAutoLockValue: PasscodeAutoLockValue = null

export type PasscodeAutoLockStorage = {
  getPasscodeAutoLock: () => Promise<PasscodeAutoLockValue>
  setPasscodeAutoLock: (value: PasscodeAutoLockValue) => Promise<void>
}

export const usePasscodeAutoLockQuery = () => {
  const { getPasscodeAutoLock } = useCore()

  return useQuery({
    queryKey: [StorageKey.passcodeAutoLock],
    queryFn: getPasscodeAutoLock,
    ...fixedDataQueryOptions,
  })
}

export const usePasscodeAutoLock = () => {
  const { data } = usePasscodeAutoLockQuery()

  return shouldBeDefined(data)
}

export const useHasPasscodeAutoLock = () => {
  const data = usePasscodeAutoLock()

  return data !== null
}
