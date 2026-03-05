import { ListItemIconWrapper } from '@core/ui/vault/settings'
import { BellIcon } from '@lib/ui/icons/BellIcon'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

import { useForceRegisterPushNotificationMutation } from '../../notifications/usePushNotificationsRegistration'

export const RegisterPushNotificationsButton = () => {
  const { t } = useTranslation()
  const { mutate: register, isPending } =
    useForceRegisterPushNotificationMutation()

  return (
    <ListItem
      icon={
        <ListItemIconWrapper>
          <BellIcon />
        </ListItemIconWrapper>
      }
      onClick={() => {
        if (!isPending) register()
      }}
      title={t('push_notifications')}
      hoverable
      showArrow
    />
  )
}
