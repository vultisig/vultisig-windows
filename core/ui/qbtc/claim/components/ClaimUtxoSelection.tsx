import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { ClaimableUtxo } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/ClaimableUtxo'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { useBitcoinChainTipHeightQuery } from '../hooks/useBitcoinChainTipHeightQuery'
import {
  useUtxoBlockHeightsQuery,
  utxoKey,
} from '../hooks/useUtxoBlockHeightsQuery'
import { ClaimableUtxoItem } from './ClaimableUtxoItem'
import {
  ActiveTabItem,
  HeaderCard,
  HeaderCardAmount,
  HeaderCardCoin,
  HeaderCardContent,
  TabStrip,
} from './ClaimUtxoSelection.styles'

const btcDecimals = 8
const maxClaimUtxos = 50

type ClaimUtxoSelectionProps = {
  utxos: ClaimableUtxo[]
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  disabled?: boolean
  onConfirm: (selected: ClaimableUtxo[]) => void
}

const toBtc = (sats: number) => sats / 10 ** btcDecimals

const formatTotalClaimable = (utxos: ClaimableUtxo[]) => {
  const totalSats = utxos.reduce((sum, u) => sum + u.amount, 0)
  return formatAmount(toBtc(totalSats), { precision: 'high' })
}

/**
 * Header + selectable list of claimable QBTC UTXOs. Selection is controlled
 * by the parent so it survives unmounts (e.g. when retrying after an error).
 *
 * The CTA label adapts: "Claim All" when every UTXO is selected, "Claim X of
 * Y" otherwise. Disabled when nothing is selected or the parent gate is
 * closed.
 */
export const ClaimUtxoSelection = ({
  utxos,
  selected,
  onSelectedChange,
  disabled,
  onConfirm,
}: ClaimUtxoSelectionProps) => {
  const { t } = useTranslation()
  const btcAddress = useCurrentVaultAddress(Chain.Bitcoin)

  const blockHeightsQuery = useUtxoBlockHeightsQuery({ btcAddress })
  const chainTipQuery = useBitcoinChainTipHeightQuery()

  if (utxos.length === 0) {
    return (
      <VStack alignItems="center" gap={8} style={{ paddingTop: 32 }}>
        <Text color="supporting" size={14}>
          {t('qbtc_claim_no_claimable_utxos')}
        </Text>
      </VStack>
    )
  }

  const toggle = (key: string) => {
    const next = new Set(selected)
    if (next.has(key)) {
      next.delete(key)
    } else if (next.size < maxClaimUtxos) {
      next.add(key)
    }
    onSelectedChange(next)
  }

  const selectedUtxos = utxos.filter(u => selected.has(utxoKey(u)))
  const totalClaimable = formatTotalClaimable(utxos)
  const allSelected = selected.size === utxos.length
  const hasSelection = selected.size > 0

  const ctaLabel =
    !hasSelection || allSelected
      ? t('qbtc_claim_all')
      : t('qbtc_claim_count', {
          count: selected.size,
          total: utxos.length,
        })

  const getBlocksAgo = (utxo: ClaimableUtxo): number | null => {
    const utxoHeight = blockHeightsQuery.data?.get(utxoKey(utxo))
    const tipHeight = chainTipQuery.data
    if (!utxoHeight || !tipHeight || utxoHeight === 0) return null
    return Math.max(0, tipHeight - utxoHeight)
  }

  return (
    <VStack gap={16}>
      <HeaderCard>
        <HeaderCardCoin aria-hidden />
        <HeaderCardContent>
          <Text size={18} weight={500} height={28 / 18} color="regular">
            {t('qbtc_claim_card_title')}
          </Text>
          <Text color="regular">
            <HeaderCardAmount>{totalClaimable} QBTC</HeaderCardAmount>
          </Text>
        </HeaderCardContent>
      </HeaderCard>

      <TabStrip>
        <ActiveTabItem>
          <Text size={14} weight={500} height={20 / 14} color="regular">
            {t('qbtc_claim_tab')}
          </Text>
        </ActiveTabItem>
      </TabStrip>

      <Text size={12} height={16 / 12} color="shyExtra">
        {t('qbtc_claim_description')}
      </Text>

      <Text size={13} weight={500} color="shy">
        {t('qbtc_claim_eligible_utxos')}
      </Text>

      <List>
        {utxos.map(utxo => {
          const key = utxoKey(utxo)
          return (
            <ClaimableUtxoItem
              key={key}
              value={utxo}
              isSelected={selected.has(key)}
              onToggle={() => toggle(key)}
              blocksAgo={getBlocksAgo(utxo)}
            />
          )
        })}
      </List>

      <Button
        kind="primary"
        disabled={!hasSelection || disabled}
        onClick={() => onConfirm(selectedUtxos)}
      >
        {ctaLabel}
      </Button>
    </VStack>
  )
}
