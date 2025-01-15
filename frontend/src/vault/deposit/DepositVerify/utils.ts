import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { CoinKey } from '../../../coin/Coin';
import { Chain } from '../../../model/chain';
import { ChainAction } from '../ChainAction';

function getDustDepositAmountString(decimals: number) {
  return (1 / Math.pow(10, decimals)).toFixed(decimals);
}

export const getFormattedFormData = (
  formData: Record<string, unknown>,
  chainAction: ChainAction,
  coin: CoinKey
) => {
  const formattedFormData = { ...formData };
  const decimals = getChainFeeCoin(
    coin.id === 'RUNE' ? Chain.THORChain : Chain.MayaChain
  )?.decimals;
  const dustAmount = getDustDepositAmountString(decimals);

  // For THORChain / MayaChain LEAVE we need to hardcode the amount for the transaction
  if (chainAction === 'leave' && (coin.id === 'RUNE' || coin.id === 'CACAO')) {
    formattedFormData.amount = dustAmount;
  }

  // For THORChain unbond and MayaChain unbond_with_lp we need to hardcode the amount on the UI
  if (
    ('amount' in formData && chainAction === 'unbond' && coin.id === 'RUNE') ||
    ('amount' in formData &&
      chainAction === 'unbond_with_lp' &&
      coin.id === 'CACAO')
  ) {
    formattedFormData.unbondAmount = formData.amount;
    formattedFormData.amount = dustAmount;
  }

  // If 'amount' doesn't exist in the current formData as it's not mandatory for MayaChain unbond_with_lp Form, we need to hardcode the amount to 0.00000001 for the transaction
  if (chainAction === 'unbond_with_lp' && coin.id === 'CACAO') {
    formattedFormData.amount = dustAmount;
  }

  return formattedFormData;
};
