import { useCore } from '@core/ui/state/core'
import { QuestionMarkIcon } from '@lib/ui/icons/QuestionMarkIcon'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'

const resourceUrl =
  'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'

export const KeygenEducationPrompt = () => {
  const { openUrl } = useCore()

  return (
    <PageHeaderIconButton
      onClick={() => {
        openUrl(resourceUrl)
      }}
      icon={<QuestionMarkIcon />}
    />
  )
}
