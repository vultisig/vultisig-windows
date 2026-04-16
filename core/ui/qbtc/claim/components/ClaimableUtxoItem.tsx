import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { ClaimableUtxo } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/ClaimableUtxo'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

const btcDecimals = 8

type ClaimableUtxoItemProps = {
  value: ClaimableUtxo
  isSelected?: boolean
  onToggle?: (next: boolean) => void
}

/** Displays a single claimable Bitcoin UTXO with txid, vout, and amount. */
export const ClaimableUtxoItem = ({
  value,
  isSelected,
  onToggle,
}: ClaimableUtxoItemProps) => {
  const { t } = useTranslation()
  const { txid, vout, amount } = value

  const btcAmount = amount / 10 ** btcDecimals
  const truncatedTxid = `${txid.slice(0, 8)}...${txid.slice(-8)}`
  const isSelectable = onToggle !== undefined

  return (
    <Panel>
      <HStack
        fullWidth
        alignItems="center"
        justifyContent="space-between"
        gap={12}
      >
        <HStack alignItems="center" gap={12}>
          {isSelectable && (
            <Checkbox value={isSelected ?? false} onChange={onToggle} />
          )}
          <VStack gap={4}>
            <Text color="contrast" size={12} family="mono">
              {truncatedTxid}:{vout}
            </Text>
            <Text color="supporting" size={12}>
              {t('qbtc_claim_txid')}
            </Text>
          </VStack>
        </HStack>
        <VStack alignItems="flex-end" gap={4}>
          <Text color="contrast" size={14} weight="600">
            {formatAmount(btcAmount, { precision: 'high' })} BTC
          </Text>
          <Text color="primary" size={12}>
            {formatAmount(btcAmount, { precision: 'high' })} QBTC
          </Text>
        </VStack>
      </HStack>
    </Panel>
  )
}
