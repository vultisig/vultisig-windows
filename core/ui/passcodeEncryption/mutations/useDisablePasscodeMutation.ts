import { useMutation } from '@tanstack/react-query'

import { useCore } from '../../state/core'

export const useDisablePasscodeMutation = () => {
  const { setPasscodeEncryption } = useCore()

  return useMutation({
    mutationFn: () => setPasscodeEncryption(null),
  })
}
