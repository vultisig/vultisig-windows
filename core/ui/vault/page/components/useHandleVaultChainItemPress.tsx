import { Chain } from '@core/chain/Chain'
import { useCopyAddress } from '@core/ui/chain/hooks/useCopyAddress'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useEffect, useState } from 'react'

type Input = {
  chain: string
  address?: string
}

export const useHandleVaultChainItemPress = ({ chain, address }: Input) => {
  const [pressedAt, setPressedAt] = useState<number | null>(null)
  const [copiedAt, setCopiedAt] = useState<number | null>(null)
  const copyAddress = useCopyAddress()

  const navigate = useCoreNavigate()

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
        navigate({ id: 'vaultChainDetail', state: { chain: chain as Chain } })
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
