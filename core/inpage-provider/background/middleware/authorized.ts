import type { BackgroundMethod } from '@core/inpage-provider/background/interface'
import type { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { authorizeContext, AuthorizedContext } from '../core/authorization'

export const authorized =
  <K extends BackgroundMethod>(
    resolver: BackgroundResolver<K, AuthorizedContext>
  ): BackgroundResolver<K> =>
  async params =>
    resolver({
      ...params,
      context: await authorizeContext(params.context),
    })
