import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { QbtcUtxo } from '../types'

const btcDecimals = 8

/** Displays a single claimable QBTC UTXO with txid, vout, and amounts. */
export const ClaimableUtxoItem = ({ value }: ValueProp<QbtcUtxo>) => {
  const { t } = useTranslation()
  const { txid, vout, amount, entitled_amount } = value

  const btcAmount = Number(amount) / 10 ** btcDecimals
  const entitledBtcAmount = Number(entitled_amount) / 10 ** btcDecimals

  const truncatedTxid = `${txid.slice(0, 8)}...${txid.slice(-8)}`

  return (
    <Panel>
      <VStack gap={8}>
        <HStack
          fullWidth
          alignItems="center"
          justifyContent="space-between"
          gap={12}
        >
          <Text color="supporting" size={12}>
            {t('qbtc_claim_txid')}
          </Text>
          <Text color="contrast" size={12} family="mono">
            {truncatedTxid}:{vout}
          </Text>
        </HStack>

        <HStack
          fullWidth
          alignItems="center"
          justifyContent="space-between"
          gap={12}
        >
          <Text color="supporting" size={12}>
            {t('qbtc_claim_btc_amount')}
          </Text>
          <Text color="contrast" size={14} weight="600">
            {formatAmount(btcAmount, { precision: 'high' })} BTC
          </Text>
        </HStack>

        <HStack
          fullWidth
          alignItems="center"
          justifyContent="space-between"
          gap={12}
        >
          <Text color="supporting" size={12}>
            {t('qbtc_claim_entitled_amount')}
          </Text>
          <Text color="primary" size={14} weight="600">
            {formatAmount(entitledBtcAmount, { precision: 'high' })} QBTC
          </Text>
        </HStack>
      </VStack>
    </Panel>
  )
}
