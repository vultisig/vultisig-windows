import {
  useIsWalletPrioritizedQuery,
  useSetIsWalletPrioritizedMutation,
} from '@core/extension/storage/isWalletPrioritized'
import { ZapIcon } from '@lib/ui/icons/ZapIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

export const Prioritize = () => {
  const { t } = useTranslation()
  const { data: isPrioritized } = useIsWalletPrioritizedQuery()
  const { mutate: setPrioritize } = useSetIsWalletPrioritizedMutation()

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
