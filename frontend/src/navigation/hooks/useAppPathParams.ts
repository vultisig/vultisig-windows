import { useLocation } from 'react-router-dom';

import { AppPathParams, AppPathsWithParams } from '..';

export function useAppPathParams<
  P extends AppPathsWithParams,
>(): AppPathParams[P] {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const result = {} as AppPathParams[P];

  queryParams.forEach((value, key) => {
    result[key as keyof AppPathParams[P]] =
      value as AppPathParams[P][keyof AppPathParams[P]];
  });

  return result;
}
