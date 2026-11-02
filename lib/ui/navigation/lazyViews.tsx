import { recordMap } from '@vultisig/lib-utils/record/recordMap'

import { lazyComponent } from '../base/lazyComponent'
import { ViewLoaders } from './ViewLoaders'
import { Views } from './Views'

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
  const lazy = recordMap(loaders, lazyComponent)

  return {
    views: recordMap(lazy, ({ Component }) => Component),
    loaders: recordMap(lazy, ({ load }) => load),
  }
}
