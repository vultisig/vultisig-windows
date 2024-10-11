import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { StrictText } from '../../../lib/ui/text';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { useAssertCurrentVaultNativeCoin } from '../../state/useCurrentVault';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendFeeValue = () => {
  const { fee } = useSendSpecificTxInfo();

  const [coinKey] = useCurrentSendCoin();
  const { decimals, ticker } = useAssertCurrentVaultNativeCoin(coinKey.chainId);

  const feeAmount = fromChainAmount(fee, decimals);

  return <StrictText>{formatAmount(feeAmount, ticker)}</StrictText>;
};
