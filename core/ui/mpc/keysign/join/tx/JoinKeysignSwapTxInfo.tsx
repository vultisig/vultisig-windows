import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@core/mpc/keysign/swap/getKeysignSwapProviderName'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { ValueProp } from '@lib/ui/props'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { assertField } from '@lib/utils/record/assertField'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

export const JoinKeysignSwapTxInfo = ({ value }: ValueProp<KeysignPayload>) => {
  const { erc20ApprovePayload, toAmount: fromAmount } = value

  const fromCoin = assertField(value, 'coin')

  const { t } = useTranslation()

  const action = without(
    [erc20ApprovePayload ? t('approve') : undefined, t('swap')],
    undefined
  ).join(` ${t('and')} `)

  const swapPayload = shouldBePresent(getKeysignSwapPayload(value))

  const { toCoin, toAmountDecimal } = getRecordUnionValue(swapPayload)
  const toAmount = Number(toAmountDecimal)

  const provider = getKeysignSwapProviderName(swapPayload)

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
            fromCoin
          )}
        </span>
      </TxOverviewRow>
      {toCoin && (
        <TxOverviewRow>
          <span>{t('to_asset')}</span>
          <span>{formatAmount(toAmount, toCoin)}</span>
        </TxOverviewRow>
      )}

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
                fromCoin
              )}
            </span>
          </TxOverviewChainDataRow>
        </>
      )}
    </>
  )
}
