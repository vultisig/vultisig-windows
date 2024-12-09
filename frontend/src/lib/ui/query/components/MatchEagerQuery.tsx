import { ReactNode } from 'react';

import { ComponentWithValueProps } from '../../props';
import { EagerQuery } from '../Query';

export type MatchEagerQueryProps<T, E = unknown> = ComponentWithValueProps<
  EagerQuery<T, E>
> & {
  pending: () => ReactNode;
  error: (errors: E[]) => ReactNode;
  success: (data: T) => ReactNode;
};

export function MatchEagerQuery<T, E = unknown>({
  value: { data, isPending, errors },
  error,
  pending,
  success,
}: MatchEagerQueryProps<T, E>) {
  if (data !== undefined) {
    return <>{success(data)}</>;
  }

  if (isPending) {
    return <>{pending()}</>;
  }

  if (errors.length > 0) {
    return <>{error(errors)}</>;
  }

  return null;
}

export type MatchEagerQueryWrapperProps<T> = Pick<
  MatchEagerQueryProps<T>,
  'success'
> &
  Partial<Pick<MatchEagerQueryProps<T>, 'error' | 'pending'>>;
