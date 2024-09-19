import { Chain } from '../../model/chain';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';

export const useCurrentVaultChainId = () => {
  const { chain } = useAppPathParams<'vaultChainDetail'>();

  return chain as Chain;
};
