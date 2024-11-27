import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppPath,
  AppPathParams,
  AppPathState,
  AppPathsWithParams,
  AppPathsWithState,
  makeAppPath,
} from '..';

type CommonOptions = { replace?: boolean };

type PathsWithParamsAndState = Extract<AppPathsWithParams, AppPathsWithState>;
type PathsWithOnlyParams = Exclude<AppPathsWithParams, PathsWithParamsAndState>;
type PathsWithOnlyState = Exclude<AppPathsWithState, PathsWithParamsAndState>;
type PathsWithNoParamsOrState = Exclude<
  AppPath,
  AppPathsWithParams | AppPathsWithState
>;

type AppNavigate = {
  <P extends PathsWithParamsAndState>(
    path: P,
    options: CommonOptions & {
      params: AppPathParams[P];
      state: AppPathState[P];
    }
  ): void;
  <P extends PathsWithOnlyParams>(
    path: P,
    options: CommonOptions & { params: AppPathParams[P] }
  ): void;
  <P extends PathsWithOnlyState>(
    path: P,
    options: CommonOptions & { state: AppPathState[P] }
  ): void;
  (path: PathsWithNoParamsOrState, options?: CommonOptions): void;
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
