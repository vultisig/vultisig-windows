import { recordMap } from '@vultisig/lib-utils/record/recordMap'
import {
  ComponentType,
  lazy,
  LazyExoticComponent,
  useSyncExternalStore,
} from 'react'

import { ViewLoaders } from './ViewLoaders'
import { Views } from './Views'

/** A component that loads its module on first render, and the loader that warms it ahead of time. */
export type LazyComponent<P extends object> = {
  Component: ComponentType<P>
  load: () => Promise<ComponentType<P>>
}

type LazyComponentState<P extends object> = {
  loaded: ComponentType<P> | null
  Lazy: LazyExoticComponent<ComponentType<P>>
}

// React schedules a retry render as soon as a load fails. Renewing the lazy
// element only after this much time keeps that render on the pinned, rejected
// one, so a chunk that stays unavailable surfaces as an error instead of
// retrying in a loop, while a later navigation tries the load again.
const failedLoadRetryDelayMs = 1000

/**
 * Turns a module loader into a component that suspends until the module has
 * loaded and then renders it with the props it was given. `load` shares the
 * component's cache, so a component loaded ahead of time renders without ever
 * suspending. A load that fails surfaces in the nearest error boundary; a
 * render that comes at least a second later tries the load again, and a
 * successful call to `load` in the meantime lets it render right away.
 */
export const lazyComponent = <P extends object>(
  loader: () => Promise<ComponentType<P>>
): LazyComponent<P> => {
  let loading: Promise<ComponentType<P>> | null = null
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

  let state: LazyComponentState<P> = { loaded: null, Lazy: createLazy() }

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

  const Component = (props: P) => {
    const { loaded: Loaded, Lazy } = useSyncExternalStore(
      subscribe,
      getSnapshot
    )

    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />
  }

  return { Component, load }
}

type LazyViews<T extends string> = {
  views: Views<T>
  loaders: ViewLoaders<T>
}

/**
 * Turns view loaders into views built with `lazyComponent`. The returned
 * loaders share the cache the views read from, so a view loaded ahead of time
 * (see `PrefetchViews`) renders without ever suspending.
 */
export const lazyViews = <T extends string>(
  loaders: ViewLoaders<T>
): LazyViews<T> => {
  const lazy = recordMap(loaders, loader => lazyComponent(loader))

  return {
    views: recordMap(lazy, ({ Component }) => Component),
    loaders: recordMap(lazy, ({ load }) => load),
  }
}
