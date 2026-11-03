import {
  useIsWalletPrioritizedQuery,
  useSetIsWalletPrioritizedMutation,
} from '@core/extension/storage/isWalletPrioritized'
import { quickSettingsIconWidth } from '@core/ui/settings/constants'
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
      iconWidth={quickSettingsIconWidth}
      control={<Switch checked={isPrioritized} size="large" />}
      onClick={() => setPrioritize(!isPrioritized)}
      title={t('prioritize_vultisig')}
      description={t('prioritize_vultisig_description')}
    />
  )
}
