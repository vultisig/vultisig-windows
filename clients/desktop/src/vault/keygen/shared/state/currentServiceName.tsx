import { useMemo } from 'react';

import { ChildrenProp } from '../../../../lib/ui/props';
import { getValueProviderSetup } from '../../../../lib/ui/state/getValueProviderSetup';
import { generateServiceName } from '../../utils/generateServiceName';

export const {
  useValue: useCurrentServiceName,
  provider: CurrentServiceNameProvider,
} = getValueProviderSetup<string>('CurrentServiceName');

export const GeneratedServiceNameProvider = ({ children }: ChildrenProp) => {
  const serviceName = useMemo(generateServiceName, []);

  return (
    <CurrentServiceNameProvider value={serviceName}>
      {children}
    </CurrentServiceNameProvider>
  );
};
