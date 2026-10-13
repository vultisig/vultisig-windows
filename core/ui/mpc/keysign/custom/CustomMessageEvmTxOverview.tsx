import { TxOverviewEvmMemo } from '@core/ui/chain/tx/TxOverviewEvmMemo'
import { EvmTxPreimage } from '@core/ui/mpc/keysign/customMessage/parseEvmTxPreimage'
import { ValueProp } from '@lib/ui/props'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { getEvmChainByChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { useTranslation } from 'react-i18next'
import { formatUnits, numberToHex } from 'viem'

import { CustomMessageReviewField } from './CustomMessageReviewField'

/**
 * Warns that a custom message is an EVM transaction's signing preimage and
 * shows what signing it would authorize. The network comes from the
 * preimage's own chain id, never from the payload, because that is the chain
 * the signature is valid on.
 */
export const CustomMessageEvmTxOverview = ({
  value: tx,
}: ValueProp<EvmTxPreimage>) => {
  const { t } = useTranslation()
  const { chainId, to, value, data } = tx

  const chain =
    chainId === null ? undefined : getEvmChainByChainId(numberToHex(chainId))

  const getNetwork = () => {
    if (chain) return chain

    if (chainId === null) return t('custom_message_tx_any_network')

    return t('custom_message_tx_chain_id', { chainId: chainId.toString() })
  }

  const getAmount = () => {
    if (!chain) return `${value} wei`

    const { decimals, ticker } = chainFeeCoin[chain]

    return `${formatUnits(value, decimals)} ${ticker}`
  }

  return (
    <>
      <WarningBlock>{t('custom_message_tx_warning')}</WarningBlock>
      <CustomMessageReviewField title={t('network')}>
        {getNetwork()}
      </CustomMessageReviewField>
      <CustomMessageReviewField title={t('to')}>
        {to ?? t('custom_message_tx_new_contract')}
      </CustomMessageReviewField>
      <CustomMessageReviewField title={t('amount')}>
        {getAmount()}
      </CustomMessageReviewField>
      {to !== null && data !== '0x' ? (
        <TxOverviewEvmMemo value={data} withinDetailsSection />
      ) : null}
    </>
  )
}
