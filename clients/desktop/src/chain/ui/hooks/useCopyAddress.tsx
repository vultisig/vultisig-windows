import { useCallback } from 'react'

import { useToast } from '../../../lib/ui/toast/ToastProvider'

export const useCopyAddress = () => {
  const { addToast } = useToast()

  return useCallback(
    (address: string) => {
      navigator.clipboard.writeText(address)
      addToast({ message: 'Address copied' })
    },
    [addToast]
  )
}
