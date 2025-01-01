import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { StrictText } from '../../../lib/ui/text';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';
import { useDepositChainSpecific } from './DepositChainSpecificProvider';

export const DepositFeeValue = () => {
  const chainSpecific = useDepositChainSpecific();
  const [coinKey] = useCurrentDepositCoin();
  const { chain } = coinKey;

  return <StrictText>{formatFee({ chain: chain, chainSpecific })}</StrictText>;
};
