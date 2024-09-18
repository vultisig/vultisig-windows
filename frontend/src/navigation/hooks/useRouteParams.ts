import { useParams } from 'react-router-dom';

import { AppPathParams, AppPathsWithParams } from '..';

export function useAppPathParams<
  P extends AppPathsWithParams,
>(): AppPathParams[P] {
  const params = useParams();
  return params as AppPathParams[P];
}
