import { useMpcServerType } from './state/mpcServerType'

export const MpcServerTypeManager = () => {
  const [serverType] = useMpcServerType()

  return <p>Coming soon: {serverType}</p>
}
