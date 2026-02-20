import { getVaultId } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getChatAuthToken } from '../auth/chatAuthStorage'

const tokenExpiryBufferMs = 60_000

export const useAuth = () => {
  const vault = useCurrentVault()
  const publicKey = vault ? getVaultId(vault) : ''

  const tokenQuery = useQuery({
    queryKey: ['chatAuth', publicKey],
    queryFn: () => getChatAuthToken(publicKey),
    enabled: !!publicKey,
    refetchOnWindowFocus: true,
  })

  return useMemo(() => {
    const token = tokenQuery.data
    const isExpired =
      !token || Date.now() >= token.expiresAt - tokenExpiryBufferMs

    return {
      accessToken: isExpired ? '' : token.accessToken,
      needsAuth: isExpired,
      isLoading: tokenQuery.isLoading,
    }
  }, [tokenQuery.data, tokenQuery.isLoading])
}
