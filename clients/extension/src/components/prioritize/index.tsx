import {
  useIsWalletPrioritizedQuery,
  useSetIsWalletPrioritizedMutation,
} from '@core/extension/storage/isWalletPrioritized'
import { SettingsItem } from '@core/ui/settings/SettingsItem'
import { BoltFilledIcon } from '@lib/ui/icons/BoltFilledIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { useTranslation } from 'react-i18next'

export const Prioritize = () => {
  const { t } = useTranslation()
  const { data: isPrioritized } = useIsWalletPrioritizedQuery()
  const { mutate: setPrioritize } = useSetIsWalletPrioritizedMutation()

  return (
    <SettingsItem
      icon={<BoltFilledIcon />}
      control={<Switch checked={isPrioritized} size="large" />}
      onClick={() => setPrioritize(!isPrioritized)}
      title={t('prioritize_vultisig')}
      description={t('prioritize_vultisig_description')}
    />
  )
}
