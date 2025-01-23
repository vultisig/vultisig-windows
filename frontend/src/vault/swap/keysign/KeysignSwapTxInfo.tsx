import { useTranslation } from 'react-i18next';

import { toKeysignSwapPayload } from '../../../chain/keysign/KeysignSwapPayload';
import { generalSwapProviderName } from '../../../chain/swap/general/GeneralSwapProvider';
import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '../../../chain/tx/components/TxOverviewRow';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { withoutUndefined } from '../../../lib/utils/array/withoutUndefined';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { getDiscriminatedUnionValue } from '../../../lib/utils/getDiscriminatedUnionValue';
import { matchDiscriminatedUnion } from '../../../lib/utils/matchDiscriminatedUnion';
import { assertField } from '../../../lib/utils/record/assertField';
import { Chain } from '../../../model/chain';

export const KeysignSwapTxInfo = ({
  value,
}: ComponentWithValueProps<KeysignPayload>) => {
  const { erc20ApprovePayload, toAmount: fromAmount } = value;

  const fromCoin = assertField(value, 'coin');

  const { t } = useTranslation();

  const action = withoutUndefined([
    erc20ApprovePayload ? t('approve') : undefined,
    t('swap'),
  ]).join(` ${t('and')} `);

  const swapPayload = toKeysignSwapPayload(value.swapPayload);

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
    oneinchSwapPayload: () => generalSwapProviderName.oneinch,
  });

  return (
    <>
      <TxOverviewRow>
        <span>{t('action')}</span>
        <span>{action}</span>
      </TxOverviewRow>
      <TxOverviewRow>
        <span>{t('provider')}</span>
        <span>{provider}</span>
      </TxOverviewRow>
      <TxOverviewRow>
        <span>{t('from_asset')}</span>
        <span>
          {formatAmount(
            fromChainAmount(fromAmount, fromCoin.decimals),
            fromCoin.ticker
          )}
        </span>
      </TxOverviewRow>
      <TxOverviewRow>
        <span>{t('to_asset')}</span>
        <span>{formatAmount(toAmount, toCoin.ticker)}</span>
      </TxOverviewRow>

      {erc20ApprovePayload && (
        <>
          <TxOverviewChainDataRow>
            <span>{t('allowance_spender')}</span>
            <span>{erc20ApprovePayload.spender}</span>
          </TxOverviewChainDataRow>
          <TxOverviewChainDataRow>
            <span>{t('allowance_amount')}</span>
            <span>
              {formatAmount(
                fromChainAmount(erc20ApprovePayload.amount, fromCoin.decimals),
                fromCoin.ticker
              )}
            </span>
          </TxOverviewChainDataRow>
        </>
      )}
    </>
  );
};
