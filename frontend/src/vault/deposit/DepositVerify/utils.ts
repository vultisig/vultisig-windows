import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { CoinKey } from '../../../coin/Coin';
import { Chain } from '../../../model/chain';
import { ChainAction } from '../ChainAction';
import { THORCHAIN_AND_MAYACHAIN_DEPOSIT_AMOUNT } from './constants';

export const getFormattedFormData = (
  formData: Record<string, unknown>,
  chainAction: ChainAction,
  coin: CoinKey
) => {
  const formattedFormData: Record<string, unknown> = {};

  Object.keys(formData).forEach(key => {
    const value = formData[key];

    if (!value) return;

    const decimals = getChainFeeCoin(
      coin.id === 'RUNE' ? Chain.THORChain : Chain.MayaChain
    )?.decimals;

    // For THORChain leave we need to hardcode the amount to 0.00000001 for the transaction
    if (chainAction === 'leave') {
      formData['amount'] =
        THORCHAIN_AND_MAYACHAIN_DEPOSIT_AMOUNT.toFixed(decimals);
    }

    // For THORChain unbond we need to hardcode the amount to 0.00000001 on the UI
    if (
      key === 'amount' &&
      (chainAction === 'unbond' || chainAction === 'unbond_with_lp')
    ) {
      formattedFormData['unbondAmount'] = formData[key];
      formattedFormData[key] =
        `${THORCHAIN_AND_MAYACHAIN_DEPOSIT_AMOUNT.toFixed(decimals)} ${coin.id}`;
    } else {
      formattedFormData[key] = value;
    }
  });

  return formattedFormData;
};
