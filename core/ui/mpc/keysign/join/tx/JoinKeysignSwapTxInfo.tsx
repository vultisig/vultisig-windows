import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { generalSwapProviderName } from '@core/chain/swap/general/GeneralSwapProvider'
import {
  KeysignSwapPayload,
  toKeysignSwapPayload,
} from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { assertField } from '@lib/utils/record/assertField'
import { useTranslation } from 'react-i18next'

export const JoinKeysignSwapTxInfo = ({ value }: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()
  const { erc20ApprovePayload, toAmount: fromAmount } = value
  const swapPayload = toKeysignSwapPayload(value.swapPayload)
  const fromCoin = assertField(value, 'coin')
  const action = withoutUndefined([
    erc20ApprovePayload ? t('approve') : undefined,
    t('swap'),
  ]).join(` ${t('and')} `)
  const swapPayloadValue = getDiscriminatedUnionValue(
    swapPayload,
    'case',
    'value',
    swapPayload.case
  )
  const toCoin = assertField(swapPayloadValue, 'toCoin')
  const toAmount = Number(swapPayloadValue.toAmountDecimal)
  const provider = matchDiscriminatedUnion<KeysignSwapPayload, string>(
    swapPayload,
    'case',
    'value',
    {
      thorchainSwapPayload: () => Chain.THORChain,
      mayachainSwapPayload: () => Chain.MayaChain,
      oneinchSwapPayload: () => generalSwapProviderName.oneinch,
    }
  )

  return (
    <>
      <ListItem title={t('action')} description={action} />
      <ListItem title={t('provider')} description={provider} />
      <ListItem
        title={t('from_asset')}
        description={formatTokenAmount(
          fromChainAmount(fromAmount, fromCoin.decimals),
          fromCoin.ticker
        )}
      />
      <ListItem
        title={t('to_asset')}
        description={formatTokenAmount(toAmount, toCoin.ticker)}
      />
      {erc20ApprovePayload && (
        <>
          <ListItem
            title={t('allowance_spender')}
            description={erc20ApprovePayload.spender}
          />
          <ListItem
            title={t('allowance_amount')}
            description={formatTokenAmount(
              fromChainAmount(erc20ApprovePayload.amount, fromCoin.decimals),
              fromCoin.ticker
            )}
          />
        </>
      )}
    </>
  )
}
