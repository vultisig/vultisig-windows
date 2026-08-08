import { getSignDataTxAction } from '@core/ui/mpc/keysign/tx/utils/getSignDataTxAction'
import { ListItem } from '@lib/ui/list/item'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { useTranslation } from 'react-i18next'

const labeledCosmosActions = [
  'delegate',
  'undelegate',
  'redelegate',
  'vote',
  'claim_rewards',
] as const

type CosmosTxTypeRowProps = {
  keysignPayload: KeysignPayload
}

/**
 * Renders a "Type" row (e.g. "Delegate") in the approval popup for Cosmos
 * staking/gov transactions so the user can tell a delegate/vote/claim apart
 * from a plain send. Renders nothing for sends and non-Cosmos txs, where the
 * existing amount/address rows already convey the action.
 */
export const CosmosTxTypeRow = ({ keysignPayload }: CosmosTxTypeRowProps) => {
  const { t } = useTranslation()
  const action = getSignDataTxAction(keysignPayload, 0)

  if (!action || !isOneOf(action.action, labeledCosmosActions)) {
    return null
  }

  return <ListItem title={t('type')} description={t(action.labelKey)} />
}
