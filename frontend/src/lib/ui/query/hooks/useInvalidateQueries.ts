import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (...queryKeys: QueryKey[]) => {
      return Promise.all(
        queryKeys.map(queryKey => {
          return queryClient.invalidateQueries({ queryKey });
        })
      );
    },
    [queryClient]
  );
};
