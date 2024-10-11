import { useMemo } from 'react';

import { feeUnitRecord } from '../../../chain/fee/feeUnitRecord';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { StrictText } from '../../../lib/ui/text';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { EvmChain } from '../../../model/chain';
import { SpecificEvm } from '../../../model/specific-transaction-info';
import { useAssertCurrentVaultNativeCoin } from '../../state/useCurrentVault';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendFeeValue = () => {
  const txInfo = useSendSpecificTxInfo();

  console.log(txInfo);

  const [coinKey] = useCurrentSendCoin();
  const { chainId } = coinKey;
  const { decimals } = useAssertCurrentVaultNativeCoin(chainId);

  const feeUnit = feeUnitRecord[chainId];

  const formattedAmount = useMemo(() => {
    if (chainId in EvmChain) {
      const { maxFeePerGasWei } = txInfo as SpecificEvm;

      return formatAmount(maxFeePerGasWei / 1e9, feeUnit);
    }

    const fee = 'byteFee' in txInfo ? txInfo.byteFee : txInfo.fee;

    const feeAmount = fromChainAmount(fee, decimals);

    return formatAmount(feeAmount, feeUnit);
  }, [chainId, decimals, feeUnit, txInfo]);

  return <StrictText>{formattedAmount}</StrictText>;
};
