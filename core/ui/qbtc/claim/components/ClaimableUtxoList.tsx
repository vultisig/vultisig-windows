import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { ClaimableUtxo } from '../types'
import { ClaimableUtxoItem } from './ClaimableUtxoItem'

type ClaimableUtxoListProps = {
  utxos: ClaimableUtxo[]
}

/** Renders a list of claimable QBTC UTXOs or an empty-state message. */
export const ClaimableUtxoList = ({ utxos }: ClaimableUtxoListProps) => {
  const { t } = useTranslation()

  if (utxos.length === 0) {
    return (
      <VStack alignItems="center" gap={8} style={{ paddingTop: 32 }}>
        <Text color="supporting" size={14}>
          {t('qbtc_claim_no_claimable_utxos')}
        </Text>
      </VStack>
    )
  }

  return (
    <List>
      {utxos.map(utxo => (
        <ClaimableUtxoItem key={`${utxo.txid}-${utxo.vout}`} value={utxo} />
      ))}
    </List>
  )
}
