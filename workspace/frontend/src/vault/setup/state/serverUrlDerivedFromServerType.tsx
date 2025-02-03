import { ChildrenProp } from '../../../lib/ui/props';
import { keygenServerUrl } from '../../keygen/server/KeygenServerType';
import { useCurrentServerType } from '../../keygen/state/currentServerType';
import { CurrentServerUrlProvider } from '../../keygen/state/currentServerUrl';

export const ServerUrlDerivedFromServerTypeProvider = ({
  children,
}: ChildrenProp) => {
  const [serverType] = useCurrentServerType();

  return (
    <CurrentServerUrlProvider value={keygenServerUrl[serverType]}>
      {children}
    </CurrentServerUrlProvider>
  );
};
