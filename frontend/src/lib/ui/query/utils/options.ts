import { UseQueryOptions } from '@tanstack/react-query';

export type UseQueryGenericOptions = Partial<
  Pick<
    UseQueryOptions<any>,
    | 'refetchOnMount'
    | 'refetchOnWindowFocus'
    | 'refetchOnReconnect'
    | 'staleTime'
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
