import { useTranslation } from 'react-i18next';

import { toKeysignSwapPayload } from '../../../chain/keysign/KeysignSwapPayload';
import { oneInchName } from '../../../chain/swap/oneInch/config';
import { TxOverviewPrimaryRow } from '../../../chain/tx/components/TxOverviewPrimaryRow';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { withoutUndefined } from '../../../lib/utils/array/withoutUndefined';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { getDiscriminatedUnionValue } from '../../../lib/utils/getDiscriminatedUnionValue';
import { getRecordUnionValue } from '../../../lib/utils/getRecordUnionValue';
import { matchDiscriminatedUnion } from '../../../lib/utils/matchDiscriminatedUnion';
import { assertField } from '../../../lib/utils/record/assertField';
import { Chain } from '../../../model/chain';
import { useKeysignMessagePayload } from '../../keysign/shared/state/keysignMessagePayload';

export const KeysignSwapTxInfo = () => {
  const payload = useKeysignMessagePayload();

  const keysignPayload = getRecordUnionValue(payload, 'keysign');

  const { erc20ApprovePayload, toAmount: fromAmount } = keysignPayload;

  const fromCoin = assertField(keysignPayload, 'coin');

  const { t } = useTranslation();

  const action = withoutUndefined([
    erc20ApprovePayload ? t('approve') : undefined,
    t('swap'),
  ]).join(` ${t('and')} `);

  const swapPayload = toKeysignSwapPayload(keysignPayload.swapPayload);

  const swapPayloadValue = getDiscriminatedUnionValue(
    swapPayload,
    'case',
    'value',
    swapPayload.case
  );

  const toCoin = assertField(swapPayloadValue, 'toCoin');
  const toAmount = Number(swapPayloadValue.toAmountDecimal);

  const provider = matchDiscriminatedUnion(swapPayload, 'case', 'value', {
    thorchainSwapPayload: () => Chain.THORChain,
    mayachainSwapPayload: () => Chain.MayaChain,
    oneinchSwapPayload: () => oneInchName,
  });

  return (
    <>
      <TxOverviewPrimaryRow title={t('action')}>{action}</TxOverviewPrimaryRow>
      <TxOverviewPrimaryRow title={t('provider')}>
        {provider}
      </TxOverviewPrimaryRow>
      <TxOverviewPrimaryRow title={t('from_asset')}>
        {formatAmount(
          fromChainAmount(fromAmount, fromCoin.decimals),
          fromCoin.ticker
        )}
      </TxOverviewPrimaryRow>
      <TxOverviewPrimaryRow title={t('to_asset')}>
        {formatAmount(toAmount, toCoin.ticker)}
      </TxOverviewPrimaryRow>

      {erc20ApprovePayload && (
        <>
          <TxOverviewPrimaryRow title={t('allowance_spender')}>
            {erc20ApprovePayload.spender}
          </TxOverviewPrimaryRow>
          <TxOverviewPrimaryRow title={t('allowance_amount')}>
            {formatAmount(
              fromChainAmount(erc20ApprovePayload.amount, fromCoin.decimals),
              fromCoin.ticker
            )}
          </TxOverviewPrimaryRow>
        </>
      )}
    </>
  );
};
