import { ManagePushNotificationsView } from '@core/ui/notifications/ManagePushNotificationsView'

import {
  useDisableDesktopPushNotificationMutation,
  useEnableDesktopPushNotificationMutation,
} from './useDesktopPushNotificationMutations'
import { useDesktopPushNotificationStatus } from './useDesktopPushNotificationStatus'

/** Desktop settings toggle for push notifications (WebSocket-based). */
export const ManageDesktopPushNotifications = () => {
  const { data: isRegistered } = useDesktopPushNotificationStatus()
  const { mutate: enable, isPending: isEnabling } =
    useEnableDesktopPushNotificationMutation()
  const { mutate: disable, isPending: isDisabling } =
    useDisableDesktopPushNotificationMutation()

  const isPending = isEnabling || isDisabling

  return (
    <ManagePushNotificationsView
      isRegistered={isRegistered}
      isPending={isPending}
      onToggle={() => {
        if (isRegistered) {
          disable()
        } else {
          enable()
        }
      }}
    />
  )
}
