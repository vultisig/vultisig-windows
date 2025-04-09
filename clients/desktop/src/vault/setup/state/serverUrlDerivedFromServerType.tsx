import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { ChildrenProp } from '@lib/ui/props'

import { MpcServerUrlProvider } from '../../../mpc/serverType/state/mpcServerUrl'

export const ServerUrlDerivedFromServerTypeProvider = ({
  children,
}: ChildrenProp) => {
  const [serverType] = useMpcServerType()

  return (
    <MpcServerUrlProvider value={mpcServerUrl[serverType]}>
      {children}
    </MpcServerUrlProvider>
  )
}
