import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { refreshKeysignPayload } from '@core/mpc/keysign/refreshKeysignPayload'
import { useQuery } from '@tanstack/react-query'

export const useRefreshedKeysignPayload = (
  keysignPayload: KeysignMessagePayload
) => {
  const { data: refreshedKeysignPayload } = useQuery({
    queryKey: ['refreshedKeysignPayload', keysignPayload],
    queryFn: () => refreshKeysignPayload(keysignPayload),
    staleTime: Infinity,
  })

  return refreshedKeysignPayload ?? keysignPayload
}
