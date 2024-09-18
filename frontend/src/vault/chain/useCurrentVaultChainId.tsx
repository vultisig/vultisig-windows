import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../model/chain';
import { useAppPathParams } from '../../navigation/hooks/useRouteParams';

export const useCurrentVaultChainId = () => {
  const { chain } = useAppPathParams<'manageVaultChainCoins'>();

  return shouldBePresent(chain) as Chain;
};
