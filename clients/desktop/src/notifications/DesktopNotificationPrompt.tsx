import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { EnableNotificationsPromptSheet } from '@core/ui/notifications/prompt/EnableNotificationsPromptSheet'
import {
  useHasSeenNotificationPrompt,
  useHasSeenNotificationPromptQuery,
} from '@core/ui/storage/hasSeenNotificationPrompt'

export const DesktopNotificationPrompt = () => {
  const { isFetched } = useHasSeenNotificationPromptQuery()
  const [hasSeen, setHasSeen] = useHasSeenNotificationPrompt()
  const navigate = useCoreNavigate()

  if (!isFetched || hasSeen) {
    return null
  }

  const markSeen = () => setHasSeen(true)

  return (
    <EnableNotificationsPromptSheet
      onClose={markSeen}
      onDismiss={() => {}}
      onEnable={async () => {
        await setHasSeen(true)
        navigate({ id: 'chooseVaults' })
      }}
    />
  )
}
