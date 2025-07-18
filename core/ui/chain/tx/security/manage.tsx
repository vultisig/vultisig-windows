import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { ListItem } from '@lib/ui/list/item'
import { t } from 'i18next'

import {
  useIsTxSecurityValidationEnabled,
  useSetIsTxSecurityValidationEnabledMutation,
} from '../../../storage/txSecurityValidation'

export const ManageTxSecurityValidation = () => {
  const value = useIsTxSecurityValidationEnabled()
  const { mutate: setValue } = useSetIsTxSecurityValidationEnabledMutation()

  return (
    <ListItem
      icon={<ShieldCheckIcon fontSize={20} />}
      title={t('blockaid_security_scan')}
      extra={<Switch checked={value} onChange={setValue} />}
    />
  )
}
