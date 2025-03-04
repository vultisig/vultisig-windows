import { mpcServerUrl } from '@core/mpc/MpcServerType'

import { ChildrenProp } from '../../../lib/ui/props'
import { useMpcServerType } from '../../../mpc/serverType/state/mpcServerType'
import { CurrentServerUrlProvider } from '../../keygen/state/currentServerUrl'

export const ServerUrlDerivedFromServerTypeProvider = ({
  children,
}: ChildrenProp) => {
  const [serverType] = useMpcServerType()

  return (
    <CurrentServerUrlProvider value={mpcServerUrl[serverType]}>
      {children}
    </CurrentServerUrlProvider>
  )
}
