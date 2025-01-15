import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { Chain } from '../../../model/chain';
import { ChainAction } from '../ChainAction';
import { AMOUNT_FOR_THORCHAIN_UNBOND } from './constants';

export const getFormattedFormData = (
  formData: Record<string, unknown>,
  chainAction: ChainAction
) => {
  const formattedFormData: Record<string, unknown> = {};

  Object.keys(formData).forEach(key => {
    const value = formData[key];

    if (!value) return;

    // For THORChain leave we need to hardcode the amount to 0.00000001 RUNE for the transaction
    if (chainAction === 'leave') {
      const runeDecimals = getChainFeeCoin(Chain.THORChain)?.decimals;
      formData['amount'] = AMOUNT_FOR_THORCHAIN_UNBOND.toFixed(runeDecimals);
    }

    // For THORChain unbond we need to hardcode the amount to 0.00000001 RUNE on the UI
    if (key === 'amount' && chainAction === 'unbond') {
      formattedFormData['unbondAmount'] = formData[key];
      formattedFormData[key] = `${AMOUNT_FOR_THORCHAIN_UNBOND.toFixed(8)} RUNE`;
    } else {
      formattedFormData[key] = value;
    }
  });

  return formattedFormData;
};
