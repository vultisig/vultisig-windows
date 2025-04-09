import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { MpcServerUrlProvider } from '@core/ui/mpc/state/mpcServerUrl'
import { ChildrenProp } from '@lib/ui/props'

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
