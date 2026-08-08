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
  /** Number of blocks since the UTXO was confirmed. `null` when the UTXO is
   * still in the mempool or the chain-tip height isn't known yet. */
  blocksAgo: number | null
}

/** Single claimable Bitcoin UTXO row matching the new QBTC claim design.
 *
 * Layout: leading checkbox, two-line left column (truncated txid:vout +
 * confirmation age), two-line right column (QBTC amount primary, BTC amount
 * secondary). */
export const ClaimableUtxoItem = ({
  value,
  isSelected,
  onToggle,
  blocksAgo,
}: ClaimableUtxoItemProps) => {
  const { t } = useTranslation()
  const { txid, vout, amount } = value

  const btcAmount = amount / 10 ** btcDecimals
  const truncatedTxid = `${txid.slice(0, 4)}...${txid.slice(-4)}:${vout}`
  const formattedAmount = formatAmount(btcAmount, { precision: 'high' })
  const isSelectable = onToggle !== undefined

  const subtitle =
    blocksAgo === null
      ? t('qbtc_claim_pending_confirmation')
      : t('qbtc_claim_confirmed_blocks_ago', { count: blocksAgo })

  return (
    <Panel>
      <HStack fullWidth alignItems="center" gap={12}>
        {isSelectable && (
          <Checkbox value={isSelected ?? false} onChange={onToggle} />
        )}
        <VStack gap={2} flexGrow>
          <Text color="contrast" size={14} weight="600">
            {truncatedTxid}
          </Text>
          <Text color="shy" size={12}>
            {subtitle}
          </Text>
        </VStack>
        <VStack alignItems="flex-end" gap={2}>
          <Text color="contrast" size={14} weight="600">
            {formattedAmount} QBTC
          </Text>
          <Text color="shy" size={12}>
            {formattedAmount} BTC
          </Text>
        </VStack>
      </HStack>
    </Panel>
  )
}
