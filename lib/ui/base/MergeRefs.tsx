import { RenderProp } from '@lib/ui/props'
import { Ref, RefCallback, useMemo } from 'react'

import { useArrayMemo } from '../hooks/useArrayMemo'
import { mergeRefs } from '../truncate/mergeRefs'

type MergeRefsProps<T> = {
  refs: (React.Ref<T> | undefined | null)[]
} & RenderProp<Ref<T> | RefCallback<T>>

export function MergeRefs<T>({ refs, render }: MergeRefsProps<T>) {
  const memoizedRefs = useArrayMemo(refs)
  const ref = useMemo(() => mergeRefs<T>(...memoizedRefs), [memoizedRefs])

  return <>{render(ref)}</>
}
