import { Chain } from '@core/chain/Chain'
import { useEffect, useState } from 'react'

import { useCopyAddress } from '../../chain/ui/hooks/useCopyAddress'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'

type Input = {
  chain: string
  address?: string
}

export const useHandleVaultChainItemPress = ({ chain, address }: Input) => {
  const [pressedAt, setPressedAt] = useState<number | null>(null)
  const [copiedAt, setCopiedAt] = useState<number | null>(null)
  const copyAddress = useCopyAddress()

  const navigate = useAppNavigate()

  useEffect(() => {
    if (!pressedAt || !address || copiedAt) {
      return
    }

    const timeout = setTimeout(
      () => {
        copyAddress(address)
        setCopiedAt(Date.now())
      },
      pressedAt + 500 - Date.now()
    )

    return () => {
      clearTimeout(timeout)
    }
  }, [address, copiedAt, copyAddress, pressedAt])

  return {
    onPointerDown: () => {
      setPressedAt(Date.now())
    },
    onPointerUp: () => {
      if (!copiedAt) {
        navigate('vaultChainDetail', { params: { chain: chain as Chain } })
      }

      setPressedAt(null)
      setCopiedAt(null)
    },
    onPointerCancel: () => {
      setPressedAt(null)
      setCopiedAt(null)
    },
  }
}
