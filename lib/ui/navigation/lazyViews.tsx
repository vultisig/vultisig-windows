import { recordMap } from '@vultisig/lib-utils/record/recordMap'
import { ComponentType, lazy, useSyncExternalStore } from 'react'

import { ViewLoader, ViewLoaders } from './ViewLoaders'
import { Views } from './Views'

type LazyView = {
  View: ComponentType
  load: ViewLoader
}

type LazyViewState = {
  loaded: ComponentType<any> | null
  Lazy: ComponentType
}

// React schedules a retry render as soon as a load fails. Renewing the lazy
// element only after this much time keeps that render on the pinned, rejected
// one, so a chunk that stays unavailable surfaces as an error instead of
// retrying in a loop, while a later navigation tries the load again.
const failedLoadRetryDelayMs = 1000

const createLazyView = (loader: ViewLoader): LazyView => {
  let loading: Promise<ComponentType<any>> | null = null
  let failedAt: number | null = null
  const listeners = new Set<() => void>()

  const load = () => {
    if (!loading) {
      loading = loader().then(
        component => {
          state = { ...state, loaded: component }
          listeners.forEach(listener => listener())
          return component
        },
        error => {
          loading = null
          failedAt = Date.now()
          throw error
        }
      )
    }

    return loading
  }

  const createLazy = () =>
    lazy(() => load().then(component => ({ default: component })))

  let state: LazyViewState = { loaded: null, Lazy: createLazy() }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }

  const getSnapshot = () => {
    if (failedAt !== null && Date.now() - failedAt >= failedLoadRetryDelayMs) {
      failedAt = null
      state = { ...state, Lazy: createLazy() }
    }

    return state
  }

  const View = () => {
    const { loaded: Loaded, Lazy } = useSyncExternalStore(
      subscribe,
      getSnapshot
    )

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
 * A load that fails surfaces in the nearest error boundary; a render that
 * comes at least a second later, such as the next navigation to the view,
 * tries the load again, and a successful call to that view's loader in the
 * meantime lets it render right away.
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
