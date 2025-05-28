import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

import { useCore } from '../../state/core'
import {
  decryptedPasscodeEncoding,
  encryptedPasscodeEncoding,
} from '../core/config'

export const useSetPasscodeMutation = () => {
  const { setPasscodeEncryption } = useCore()

  return useMutation({
    mutationFn: async (passcode: string) => {
      const sample = uuidv4()
      const encryptedSample = encryptWithAesGcm({
        value: Buffer.from(sample, decryptedPasscodeEncoding),
        key: Buffer.from(passcode, decryptedPasscodeEncoding),
      }).toString(encryptedPasscodeEncoding)

      await setPasscodeEncryption({
        sample,
        encryptedSample,
      })
    },
  })
}
