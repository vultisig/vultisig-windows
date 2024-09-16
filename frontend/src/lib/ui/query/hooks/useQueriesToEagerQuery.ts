import { UseQueryResult } from '@tanstack/react-query';

import { isEmpty } from '../../../utils/array/isEmpty';
import { withoutUndefined } from '../../../utils/array/withoutUndefined';
import { EagerQuery } from '../Query';

type ToEagerQueryInput<T, R, E = unknown> = {
  queries: UseQueryResult<T, E>[];
  joinData: (items: T[]) => R;
};

export function useQueriesToEagerQuery<T, R, E = unknown>({
  queries,
  joinData,
}: ToEagerQueryInput<T, R, E>): EagerQuery<R, E> {
  if (isEmpty(queries)) {
    return {
      isPending: false,
      errors: [],
      data: joinData([]),
    };
  }
  const resolvedQueries = withoutUndefined(queries.map(query => query.data));
  return {
    isPending: queries.some(query => query.isPending),
    errors: queries.flatMap(query => query.error ?? []),
    data: isEmpty(resolvedQueries) ? undefined : joinData(resolvedQueries),
  };
}
