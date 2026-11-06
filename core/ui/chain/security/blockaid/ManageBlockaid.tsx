import { SettingsItem } from '@core/ui/settings/SettingsItem'
import { ScanIcon } from '@lib/ui/icons/ScanIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { useTranslation } from 'react-i18next'

import {
  useIsBlockaidEnabled,
  useSetIsBlockaidEnabledMutation,
} from '../../../storage/blockaid'

/** Settings row toggling the Blockaid transaction scan. */
export const ManageBlockaid = ({ iconWidth }: { iconWidth?: number }) => {
  const value = useIsBlockaidEnabled()
  const { mutate: setValue } = useSetIsBlockaidEnabledMutation()
  const { t } = useTranslation()

  return (
    <SettingsItem
      icon={<ScanIcon />}
      iconWidth={iconWidth}
      title={t('blockaid_security_scan')}
      description={t('blockaid_security_scan_description')}
      control={<Switch checked={value} onChange={setValue} size="large" />}
    />
  )
}
