import { EnableNotificationsPromptSheet } from './EnableNotificationsPromptSheet'

type EnableNotificationsWelcomeProps = {
  onDismiss: () => void
  onEnable: () => void
}

export const EnableNotificationsWelcome = ({
  onDismiss,
  onEnable,
}: EnableNotificationsWelcomeProps) => (
  <EnableNotificationsPromptSheet
    onClose={onDismiss}
    onDismiss={onDismiss}
    onEnable={onEnable}
  />
)
