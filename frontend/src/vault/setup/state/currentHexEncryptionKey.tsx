import { useMemo } from 'react';

import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { getValueProviderSetup } from '../../../lib/ui/state/getValueProviderSetup';
import { generateHexEncryptionKey } from '../../keygen/utils/generateHexEncryptionKey';

export const {
  useValue: useCurrentHexEncryptionKey,
  provider: CurrentHexEncryptionKeyProvider,
} = getValueProviderSetup<string>('CurrentHexEncryptionKey');

export const GeneratedHexEncryptionKeyProvider = ({
  children,
}: ComponentWithChildrenProps) => {
  const HexEncryptionKey = useMemo(generateHexEncryptionKey, []);

  return (
    <CurrentHexEncryptionKeyProvider value={HexEncryptionKey}>
      {children}
    </CurrentHexEncryptionKeyProvider>
  );
};
