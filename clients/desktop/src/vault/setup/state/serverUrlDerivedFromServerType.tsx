import { mpcServerUrl } from '@core/mpc/MpcServerType'

import { ChildrenProp } from '../../../lib/ui/props'
import { useCurrentServerType } from '../../keygen/state/currentServerType'
import { CurrentServerUrlProvider } from '../../keygen/state/currentServerUrl'

export const ServerUrlDerivedFromServerTypeProvider = ({
  children,
}: ChildrenProp) => {
  const [serverType] = useCurrentServerType()

  return (
    <CurrentServerUrlProvider value={mpcServerUrl[serverType]}>
      {children}
    </CurrentServerUrlProvider>
  )
}
