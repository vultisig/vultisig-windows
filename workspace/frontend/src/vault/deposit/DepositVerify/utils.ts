import { storage } from '../../../../wailsjs/go/models';
import { chainFeeCoin } from '../../../coin/chainFeeCoin';
import { Chain } from '../../../model/chain';
import { ChainAction } from '../ChainAction';

function getDustDepositAmountString(decimals: number) {
  return (1 / Math.pow(10, decimals)).toFixed(decimals);
}

export const getFormattedFormData = (
  formData: Record<string, unknown>,
  chainAction: ChainAction,
  coin: storage.Coin
) => {
  const formattedFormData = { ...formData };
  const { decimals } = chainFeeCoin[coin.chain as Chain];
  const dustAmount = getDustDepositAmountString(decimals);

  // For THORChain / MayaChain LEAVE we need to hardcode the amount for the transaction
  if (
    chainAction === 'leave' &&
    (coin.ticker === 'RUNE' || coin.ticker === 'CACAO')
  ) {
    formattedFormData.amount = dustAmount;
  }

  // For THORChain unbond and MayaChain unbond_with_lp we need to hardcode the amount on the UI
  if (
    ('amount' in formData && chainAction === 'unbond') ||
    ('amount' in formData && chainAction === 'unbond_with_lp')
  ) {
    formattedFormData.unbondAmount = formData.amount;
    formattedFormData.amount = dustAmount;
  }

  // If 'amount' doesn't exist in the current formData as it's not mandatory for MayaChain unbond_with_lp Form, we need to hardcode the amount to 0.00000001 for the transaction
  if (chainAction === 'unbond_with_lp') {
    formattedFormData.amount = dustAmount;
  }

  return formattedFormData;
};
