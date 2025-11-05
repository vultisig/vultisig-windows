import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { Button } from '@lib/ui/buttons/Button'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FoldersSection } from './components/FoldersSection'
import { VaultsSection } from './components/VaultsSection'

export const ManageVaultsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const goBack = useNavigateBack()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        secondaryControls={<DoneButton onClick={goBack} />}
        title={t('edit_vaults')}
      />
      <PageContent gap={32} flexGrow scrollable>
        <FoldersSection />
        <VaultsSection />
        <AddFolderButton
          kind="secondary"
          onClick={() => navigate({ id: 'createVaultFolder' })}
          icon={
            <IconWrapper size={18}>
              <PlusIcon />
            </IconWrapper>
          }
        >
          {t('add_folder')}
        </AddFolderButton>
      </PageContent>
    </VStack>
  )
}

const AddFolderButton = styled(Button)`
  border-radius: 40px;
  border: 1px solid ${getColor('buttonPrimary')};
  background: transparent;

  &:hover {
    border-color: ${({ theme }) =>
      theme.colors.buttonPrimary.withAlpha(0.7).toCssValue()};
    background: transparent;
  }
`
