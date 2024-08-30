import { useParams } from 'react-router-dom';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';

export const useCurrentVaultChainId = () => {
  const { chain } = useParams<{ chain: string }>();

  return shouldBePresent(chain);
};
