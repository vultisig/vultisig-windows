import { useCore } from '@core/ui/state/core'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CircleHelpIcon } from '@lib/ui/icons/CircleHelpIcon'

const resourceUrl =
  'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'

export const KeygenEducationPrompt = () => {
  const { openUrl } = useCore()

  return (
    <IconButton onClick={() => openUrl(resourceUrl)}>
      <CircleHelpIcon />
    </IconButton>
  )
}
