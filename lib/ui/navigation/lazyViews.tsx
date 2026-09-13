import { recordMap } from '@vultisig/lib-utils/record/recordMap'
import { ComponentType, lazy, useSyncExternalStore } from 'react'

import { ViewLoader, ViewLoaders } from './ViewLoaders'
import { Views } from './Views'

type LazyView = {
  View: ComponentType
  load: ViewLoader
}

const createLazyView = (loader: ViewLoader): LazyView => {
  let loading: Promise<ComponentType<any>> | null = null
  let loaded: ComponentType<any> | null = null
  const listeners = new Set<() => void>()

  const load = () => {
    if (!loading) {
      loading = loader().then(
        component => {
          loaded = component
          listeners.forEach(listener => listener())
          return component
        },
        error => {
          loading = null
          throw error
        }
      )
    }

    return loading
  }

  const Lazy = lazy(() => load().then(component => ({ default: component })))

  const subscribe = (listener: () => void) => {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }

  const getSnapshot = () => loaded

  const View = () => {
    const Loaded = useSyncExternalStore(subscribe, getSnapshot)

    return Loaded ? <Loaded /> : <Lazy />
  }

  return { View, load }
}

type LazyViews<T extends string> = {
  views: Views<T>
  loaders: ViewLoaders<T>
}

/**
 * Turns view loaders into components that suspend until their module has
 * loaded. The returned loaders share the cache the views read from, so a view
 * loaded ahead of time (see `PrefetchViews`) renders without ever suspending.
 * A load that fails surfaces in the nearest error boundary, as with
 * `React.lazy`; a later successful call to that view's loader still lets it
 * render, since the view reads the shared cache first.
 */
export const lazyViews = <T extends string>(
  loaders: ViewLoaders<T>
): LazyViews<T> => {
  const lazy = recordMap(loaders, createLazyView)

  return {
    views: recordMap(lazy, ({ View }) => View),
    loaders: recordMap(lazy, ({ load }) => load),
  }
}
