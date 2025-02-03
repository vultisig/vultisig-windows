import { ReactNode, useMemo } from 'react';

import { useArrayMemo } from '../hooks/useArrayMemo';
import { mergeRefs } from '../utils/mergeRefs';

type MergeRefsProps<T> = {
  refs: (React.Ref<T> | undefined | null)[];
  render: (ref: React.Ref<T>) => ReactNode;
};

export function MergeRefs<T>({ refs, render }: MergeRefsProps<T>) {
  const memoizedRefs = useArrayMemo(refs);
  const ref = useMemo(() => mergeRefs<T>(...memoizedRefs), [memoizedRefs]);

  return <>{render(ref)}</>;
}
