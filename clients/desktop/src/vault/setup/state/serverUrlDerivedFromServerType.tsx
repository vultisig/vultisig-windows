import { keygenServerUrl } from '@core/keygen/server/KeygenServerType'

import { ChildrenProp } from '../../../lib/ui/props'
import { useCurrentServerType } from '../../keygen/state/currentServerType'
import { CurrentServerUrlProvider } from '../../keygen/state/currentServerUrl'

export const ServerUrlDerivedFromServerTypeProvider = ({
  children,
}: ChildrenProp) => {
  const [serverType] = useCurrentServerType()

  return (
    <CurrentServerUrlProvider value={keygenServerUrl[serverType]}>
      {children}
    </CurrentServerUrlProvider>
  )
}
