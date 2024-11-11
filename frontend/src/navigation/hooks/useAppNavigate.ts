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
    options: { params: AppPathParams[P]; state: AppPathState[P] }
  ): void;
  <P extends PathsWithOnlyParams>(
    path: P,
    options: { params: AppPathParams[P] }
  ): void;
  <P extends PathsWithOnlyState>(
    path: P,
    options: { state: AppPathState[P] }
  ): void;
  (path: PathsWithNoParamsOrState): void;
};

export function useAppNavigate(): AppNavigate {
  const navigate = useNavigate();

  const appNavigate = useCallback(
    (path: AppPath, options?: any) => {
      const to = options?.params
        ? makeAppPath(path as any, options.params)
        : makeAppPath(path as any);

      navigate(to, options?.state ? { state: options.state } : undefined);
    },
    [navigate]
  );

  return appNavigate as AppNavigate;
}
