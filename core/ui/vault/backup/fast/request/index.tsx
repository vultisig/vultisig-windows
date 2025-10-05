import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { PageHeaderBackButton } from '../../../../flow/PageHeaderBackButton'

export const RequestFastVaultBackup = () => {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader
        title={t('server_backup')}
        primaryControls={<PageHeaderBackButton />}
      />
      <FitPageContent contentMaxWidth={468}>
        <p>Form will be here!</p>
      </FitPageContent>
    </>
  )
}
