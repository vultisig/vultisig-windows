import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

const passcodeAutoLockDurations = [1, 5, 10, 15, 30] as const

export const passcodeAutoLockOptions = [
  ...passcodeAutoLockDurations,
  null,
] as const

export type PasscodeAutoLockValue = (typeof passcodeAutoLockOptions)[number]

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
    ...noRefetchQueryOptions,
  })
}

export const usePasscodeAutoLock = () => {
  const { data } = usePasscodeAutoLockQuery()

  return shouldBeDefined(data)
}
