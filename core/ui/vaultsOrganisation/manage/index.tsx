import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { Button } from '@lib/ui/buttons/Button'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { FoldersSection } from './components/FoldersSection'
import { VaultsSection } from './components/VaultsSection'

export const ManageVaultsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const goBack = useNavigateBack()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        secondaryControls={<DoneButton onClick={goBack} />}
        title={t('edit_vaults')}
      />
      <PageContent gap={32} scrollable>
        <FoldersSection />
        <VaultsSection />
      </PageContent>
      <PageFooter>
        <Button
          kind="secondary"
          onClick={() => navigate({ id: 'createVaultFolder' })}
        >
          {t('add_folder')}
        </Button>
      </PageFooter>
    </>
  )
}
