import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'

import type { PasscodeAttemptState } from '../passcodeEncryption/core/passcodeAttemptThrottle'
import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

type PasscodeEncryption = {
  encryptedSample: string | null
  passcodeLength?: number
  attemptState?: PasscodeAttemptState
}

export type PasscodeEncryptionValue = PasscodeEncryption | null

export const initialPasscodeEncryptionValue: PasscodeEncryptionValue = null

export type PasscodeEncryptionStorage = {
  getPasscodeEncryption: () => Promise<PasscodeEncryptionValue>
  setPasscodeEncryption: (value: PasscodeEncryptionValue) => Promise<void>
}

export const usePasscodeEncryptionQuery = () => {
  const { getPasscodeEncryption } = useCore()

  return useQuery({
    queryKey: [StorageKey.passcodeEncryption],
    queryFn: getPasscodeEncryption,
    ...noRefetchQueryOptions,
  })
}

export const usePasscodeEncryption = () => {
  const { data } = usePasscodeEncryptionQuery()

  return shouldBeDefined(data)
}
