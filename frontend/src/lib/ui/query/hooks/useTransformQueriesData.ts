import { useMemo } from 'react';

import { getRecordSize } from '../../../utils/record/getRecordSize';
import { recordMap } from '../../../utils/record/recordMap';
import { withoutUndefinedFields } from '../../../utils/record/withoutUndefinedFields';
import { NonUndefined } from '../../../utils/types/NonUndefined';
import { Query } from '../Query';

export function useTransformQueriesData<
  T extends Record<string, Query<any, E>>,
  E = unknown,
  R = unknown,
>(
  queriesRecord: T,
  transform: (data: { [K in keyof T]: NonUndefined<T[K]['data']> }) => R
): Query<R, E> {
  return useMemo(() => {
    const dataRecord = withoutUndefinedFields(
      recordMap(queriesRecord, ({ data }) => data)
    );

    if (getRecordSize(dataRecord) === getRecordSize(queriesRecord)) {
      try {
        return {
          data: transform(
            dataRecord as { [K in keyof T]: NonUndefined<T[K]['data']> }
          ),
          isPending: false,
          isLoading: false,
          error: null,
        };
      } catch (error) {
        return {
          data: undefined,
          isPending: false,
          isLoading: false,
          error: error as E,
        };
      }
    }

    const queries = Object.values(queriesRecord);

    return {
      data: undefined,
      error: queries.find(({ error }) => error)?.error ?? null,
      isPending: queries.some(({ isPending }) => isPending),
      isLoading: queries.some(({ isLoading }) => isLoading),
    };
  }, [queriesRecord, transform]);
}
