import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';
import { useDepositChainSpecific } from './DepositChainSpecificProvider';

export const DepositFeeValue = () => {
  const chainSpecific = useDepositChainSpecific();
  const [coinKey] = useCurrentDepositCoin();
  const { chain } = coinKey;

  return <>{formatFee({ chain: chain, chainSpecific })}</>;
};
