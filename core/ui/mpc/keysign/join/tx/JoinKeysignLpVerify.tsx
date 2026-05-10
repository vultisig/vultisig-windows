import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import {
  TxOverviewChainDataRow,
  TxOverviewPrimaryRowTitle,
  TxOverviewRow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { ValueProp } from '@lib/ui/props'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useTranslation } from 'react-i18next'

import { JoinKeysignTxPrimaryInfo } from './JoinKeysignTxPrimaryInfo'
import { ThorLpMemo } from './parseThorLpMemo'

type Props = ValueProp<KeysignPayload> & {
  lp: ThorLpMemo
}

/**
 * Joiner verify view for THORChain LP add/remove deposits. Renders Pool and
 * (when present) Paired Address rows alongside the standard transaction info.
 */
export const JoinKeysignLpVerify = ({ value, lp }: Props) => {
  const { t } = useTranslation()

  return (
    <TxOverviewPanel>
      <TxOverviewRow>
        <span>{t('pool')}</span>
        <span>{lp.pool}</span>
      </TxOverviewRow>
      {lp.kind === 'add' && lp.pairedAddress && (
        <TxOverviewChainDataRow>
          <TxOverviewPrimaryRowTitle>
            {t('paired_address')}
          </TxOverviewPrimaryRowTitle>
          <span>{lp.pairedAddress}</span>
        </TxOverviewChainDataRow>
      )}
      <JoinKeysignTxPrimaryInfo value={value} />
    </TxOverviewPanel>
  )
}
