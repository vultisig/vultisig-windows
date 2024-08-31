import { useParams } from 'react-router-dom';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../model/chain';

export const useCurrentVaultChainId = () => {
  const { chain } = useParams<{ chain: string }>();

  return shouldBePresent(chain) as Chain;
};
