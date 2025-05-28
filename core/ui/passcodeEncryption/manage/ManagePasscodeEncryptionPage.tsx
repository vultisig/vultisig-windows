import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EnablePasscodeInput } from './EnablePasscodeInput'

export const ManagePasscodeEncryptionPage = () => {
  const { t } = useTranslation()
  const [value, setValue] = useState(false)

  return (
    <>
      <FlowPageHeader title={t('security')} />
      <FitPageContent>
        <EnablePasscodeInput value={value} onChange={setValue} />
      </FitPageContent>
    </>
  )
}
