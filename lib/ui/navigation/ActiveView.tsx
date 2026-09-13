import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { ReactNode, Suspense, useRef } from 'react'

import { Center } from '../layout/Center'
import { Spinner } from '../loaders/Spinner'
import { useNavigation } from './state'
import { Views } from './Views'

type ActiveViewProps = {
  views: Views
  /** Shown while the current view's module, or data it suspends on, is still loading. */
  fallback?: ReactNode
}

const defaultFallback = (
  <Center>
    <Spinner />
  </Center>
)

/**
 * Renders the view on top of the navigation history behind a Suspense
 * boundary, so registries built from `lazyViews` can load a page's module on
 * first use. Each navigation remounts the view.
 */
export const ActiveView = ({
  views,
  fallback = defaultFallback,
}: ActiveViewProps) => {
  const [{ history }] = useNavigation()
  const viewKeyRef = useRef(0)
  const prevHistoryLengthRef = useRef(history.length)
  const prevViewIdRef = useRef(getLastItem(history).id)

  const currentView = getLastItem(history)
  if (
    prevHistoryLengthRef.current !== history.length ||
    prevViewIdRef.current !== currentView.id
  ) {
    viewKeyRef.current++
    prevHistoryLengthRef.current = history.length
    prevViewIdRef.current = currentView.id
  }

  const { id } = currentView
  const View = views[id]

  return (
    <Suspense fallback={fallback}>
      <View key={viewKeyRef.current} />
    </Suspense>
  )
}
