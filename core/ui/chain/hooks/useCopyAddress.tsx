import { useToast } from '@lib/ui/toast/ToastProvider'
import { useCallback } from 'react'

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
