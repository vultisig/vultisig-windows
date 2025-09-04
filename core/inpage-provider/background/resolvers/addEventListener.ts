import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { backgroundEventSubscriptions } from '../events/subscriptions'

export const addEventListener: BackgroundResolver<'addEventListener'> = async ({
  context: { requestOrigin },
  input: { event },
}) => {
  const appId = getUrlBaseDomain(requestOrigin)
  if (!backgroundEventSubscriptions[appId][event]) {
    backgroundEventSubscriptions[appId][event] = crypto.randomUUID()
  }

  return backgroundEventSubscriptions[appId][event]
}
