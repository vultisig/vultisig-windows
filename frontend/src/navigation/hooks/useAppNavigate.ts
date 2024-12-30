import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppPath,
  AppPathParams,
  AppPathState,
  AppPathsWithNoParamsOrState,
  AppPathsWithOnlyParams,
  AppPathsWithOnlyState,
  AppPathsWithParamsAndState,
  makeAppPath,
} from '..';

type CommonOptions = { replace?: boolean };

type AppNavigate = {
  <P extends AppPathsWithParamsAndState>(
    path: P,
    options: CommonOptions & {
      params: AppPathParams[P];
      state: AppPathState[P];
    }
  ): void;
  <P extends AppPathsWithOnlyParams>(
    path: P,
    options: CommonOptions & { params: AppPathParams[P] }
  ): void;
  <P extends AppPathsWithOnlyState>(
    path: P,
    options: CommonOptions & { state: AppPathState[P] }
  ): void;
  (path: AppPathsWithNoParamsOrState, options?: CommonOptions): void;
};

export function useAppNavigate(): AppNavigate {
  const navigate = useNavigate();
  const appNavigate = useCallback(
    (path: AppPath, { params, ...options }: any = {}) => {
      const to = params
        ? makeAppPath(path as any, params)
        : makeAppPath(path as any);

      navigate(to, options);
    },
    [navigate]
  );

  return appNavigate as AppNavigate;
}
