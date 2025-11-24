import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

import {
  useIsBlockaidEnabled,
  useSetIsBlockaidEnabledMutation,
} from '../../../storage/blockaid'

export const ManageBlockaid = () => {
  const value = useIsBlockaidEnabled()
  const { mutate: setValue } = useSetIsBlockaidEnabledMutation()
  const { t } = useTranslation()

  return (
    <ListItem
      icon={
        <IconWrapper size={20} color="primaryAlt">
          <ShieldCheckIcon />
        </IconWrapper>
      }
      title={t('blockaid_security_scan')}
      extra={<Switch checked={value} onChange={setValue} />}
    />
  )
}
