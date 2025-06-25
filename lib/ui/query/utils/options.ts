import { UseQueryOptions } from '@tanstack/react-query'

type UseQueryGenericOptions = Partial<
  Pick<
    UseQueryOptions<any>,
    | 'refetchOnMount'
    | 'refetchOnWindowFocus'
    | 'refetchOnReconnect'
    | 'staleTime'
    | 'refetchInterval'
    | 'refetchIntervalInBackground'
    | 'meta'
  >
>

export const noRefetchQueryOptions: UseQueryGenericOptions = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
}

export const noPersistQueryOptions: UseQueryGenericOptions = {
  meta: { disablePersist: true },
}

export const pollingQueryOptions = (
  interval: number
): UseQueryGenericOptions => ({
  refetchInterval: interval,
  refetchIntervalInBackground: true,
})
