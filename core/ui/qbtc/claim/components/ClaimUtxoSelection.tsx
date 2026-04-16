import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Text } from '@lib/ui/text'
import { ClaimableUtxo } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/ClaimableUtxo'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ClaimableUtxoItem } from './ClaimableUtxoItem'

const btcDecimals = 8
const maxClaimUtxos = 50

type ClaimUtxoSelectionProps = {
  utxos: ClaimableUtxo[]
  disabled?: boolean
  onConfirm: (selected: ClaimableUtxo[]) => void
}

const utxoKey = (utxo: ClaimableUtxo) => `${utxo.txid}:${utxo.vout}`

/**
 * Displays a selectable list of claimable QBTC UTXOs with a running total and
 * a "Claim Selected" CTA. Enforces the 1–50 UTXOs-per-claim limit.
 */
export const ClaimUtxoSelection = ({
  utxos,
  disabled,
  onConfirm,
}: ClaimUtxoSelectionProps) => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  if (utxos.length === 0) {
    return (
      <VStack alignItems="center" gap={8} style={{ paddingTop: 32 }}>
        <Text color="supporting" size={14}>
          {t('qbtc_claim_no_claimable_utxos')}
        </Text>
      </VStack>
    )
  }

  const toggle = (key: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else if (next.size < maxClaimUtxos) {
        next.add(key)
      }
      return next
    })

  const selectedUtxos = utxos.filter(utxo => selected.has(utxoKey(utxo)))
  const totalSats = selectedUtxos.reduce((sum, utxo) => sum + utxo.amount, 0)
  const totalBtc = totalSats / 10 ** btcDecimals
  const hasSelection = selected.size > 0

  return (
    <VStack gap={16}>
      <List>
        {utxos.map(utxo => {
          const key = utxoKey(utxo)
          return (
            <ClaimableUtxoItem
              key={key}
              value={utxo}
              isSelected={selected.has(key)}
              onToggle={() => toggle(key)}
            />
          )
        })}
      </List>

      <HStack
        fullWidth
        alignItems="center"
        justifyContent="space-between"
        gap={12}
      >
        <VStack gap={4}>
          <Text color="supporting" size={12}>
            {t('qbtc_claim_selected_count', {
              count: selected.size,
              max: maxClaimUtxos,
            })}
          </Text>
          <Text color="contrast" size={14} weight="600">
            {formatAmount(totalBtc, { precision: 'high' })} BTC
          </Text>
        </VStack>
        <Button
          kind="primary"
          disabled={!hasSelection || disabled}
          onClick={() => onConfirm(selectedUtxos)}
        >
          {t('qbtc_claim_confirm')}
        </Button>
      </HStack>
    </VStack>
  )
}
