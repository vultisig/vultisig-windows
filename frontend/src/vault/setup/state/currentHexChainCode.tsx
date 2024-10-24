import { useMemo } from 'react';

import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';
import { generateHexChainCode } from '../../keygen/utils/generateHexChainCode';

export const {
  useValue: useCurrentHexChainCode,
  provider: CurrentHexChainCodeProvider,
} = getValueProviderSetup<string>('CurrentHexChainCode');

export const GeneratedHexChainCodeProvider = ({
  children,
}: ComponentWithChildrenProps) => {
  const HexChainCode = useMemo(generateHexChainCode, []);

  return (
    <CurrentHexChainCodeProvider value={HexChainCode}>
      {children}
    </CurrentHexChainCodeProvider>
  );
};
