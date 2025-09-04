import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { backgroundEventSubscriptions } from '../events/subscriptions'

export const addEventListener: BackgroundResolver<'addEventListener'> = async ({
  context: { requestOrigin },
  input: { event },
}) => {
  if (!backgroundEventSubscriptions[requestOrigin][event]) {
    backgroundEventSubscriptions[requestOrigin][event] = crypto.randomUUID()
  }

  return backgroundEventSubscriptions[requestOrigin][event]
}
