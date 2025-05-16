import {
  useIsPrioritizedWalletQuery,
  useSetPrioritizeWalletMutation,
} from '@clients/extension/src/state/currentSettings/isPrioritized'
import { ZapIcon } from '@lib/ui/icons/ZapIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

export const Prioritize = () => {
  const { t } = useTranslation()
  const { data: isPrioritized } = useIsPrioritizedWalletQuery()
  const { mutate: setPrioritize } = useSetPrioritizeWalletMutation()

  return (
    <ListItem
      icon={<ZapIcon fontSize={20} />}
      extra={<Switch checked={isPrioritized} />}
      onClick={() => setPrioritize(!isPrioritized)}
      title={t('prioritize_vultisig')}
      hoverable
    />
  )
}
