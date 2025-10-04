import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

type PasscodeEncryption = {
  encryptedSample: string
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

export const useHasPasscodeEncryption = () => {
  const data = usePasscodeEncryption()

  return data !== null
}
