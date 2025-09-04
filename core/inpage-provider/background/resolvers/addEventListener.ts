import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { addAppSubscription } from '../events/subscriptions'

export const addEventListener: BackgroundResolver<'addEventListener'> = async ({
  context: { requestOrigin },
  input: { event },
}) => {
  const appId = getUrlBaseDomain(requestOrigin)

  return addAppSubscription({ appId, event })
}
