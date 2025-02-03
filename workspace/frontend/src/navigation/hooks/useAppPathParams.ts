import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { parseUrlSearchString } from '@lib/utils/query/parseUrlSearchString';
import { toEntries } from '@li@lib/utilsrd/toEntries';
import { withoutUndefinedFields } from '@li@lib/utilsrd/withoutUndefinedFields';
import { AppPathParams, AppPathsWithParams } from '..';

export function useAppPathParams<P extends AppPathsWithParams>() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchString = searchParams.toString();

  const setParams = useCallback(
    (
      newParams:
        | Partial<AppPathParams[P]>
        | ((prevParams: AppPathParams[P]) => Partial<AppPathParams[P]>)
    ) => {
      setSearchParams(
        prevSearchParams => {
          const prevParams = parseUrlSearchString<AppPathParams[P]>(
            prevSearchParams.toString()
          );

          const updatedParams =
            typeof newParams === 'function'
              ? newParams(prevParams)
              : { ...prevParams, ...newParams };

          const result = new URLSearchParams({});

          toEntries(withoutUndefinedFields(updatedParams)).forEach(
            ({ key, value }) => {
              result.set(key, String(value));
            }
          );

          return result;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return [
    useMemo(
      () => parseUrlSearchString<AppPathParams[P]>(searchString),
      [searchString]
    ),
    setParams,
  ] as const;
}
