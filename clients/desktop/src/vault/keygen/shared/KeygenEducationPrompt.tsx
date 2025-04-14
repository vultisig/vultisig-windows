import { QuestionMarkIcon } from '@lib/ui/icons/QuestionMarkIcon'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime'

const resourceUrl =
  'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'

export const KeygenEducationPrompt = () => {
  return (
    <PageHeaderIconButton
      onClick={() => {
        BrowserOpenURL(resourceUrl)
      }}
      icon={<QuestionMarkIcon />}
    />
  )
}
