import { UseQueryOptions } from '@tanstack/react-query';

export type UseQueryGenericOptions = Partial<
  Pick<
    UseQueryOptions<any>,
    | 'refetchOnMount'
    | 'refetchOnWindowFocus'
    | 'refetchOnReconnect'
    | 'staleTime'
    | 'refetchInterval'
    | 'refetchIntervalInBackground'
  >
>;

export const noRefetchQueryOptions: UseQueryGenericOptions = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export const fixedDataQueryOptions: UseQueryGenericOptions = {
  ...noRefetchQueryOptions,
  staleTime: Infinity,
};

export const pollingQueryOptions = (
  interval: number
): UseQueryGenericOptions => ({
  refetchInterval: interval,
  refetchIntervalInBackground: true,
});
