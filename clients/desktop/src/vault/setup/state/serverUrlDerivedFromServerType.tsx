import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { ChildrenProp } from '@lib/ui/props'

import { useMpcServerType } from '../../../mpc/serverType/state/mpcServerType'
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
