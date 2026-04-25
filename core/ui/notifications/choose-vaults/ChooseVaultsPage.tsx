import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import {
  ChooseVaultsContent,
  VaultNotificationItem,
} from '@core/ui/notifications/choose-vaults/ChooseVaultsContent'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ChooseVaultsPageProps = {
  vaults: VaultNotificationItem[]
  onVaultToggle: (vaultId: string, enabled: boolean) => void
  onEnableAll: (enabled: boolean) => void
  allEnabled: boolean
  onDone: () => void
  onBack: () => void
}

export const ChooseVaultsPage: FC<ChooseVaultsPageProps> = ({
  onBack,
  onDone,
  ...contentProps
}) => {
  const { t } = useTranslation()

  return (
    <VStack fullHeight>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={
          <DoneButton type="button" onClick={onDone}>
            <Text color="primaryAlt" size={14} weight={500}>
              {t('done')}
            </Text>
          </DoneButton>
        }
        title={t('choose_vaults')}
      />
      <PageContent flexGrow scrollable>
        <ChooseVaultsContent {...contentProps} />
      </PageContent>
    </VStack>
  )
}

const DoneButton = styled.button`
  background-color: ${getColor('foreground')};
  border: none;
  border-radius: 99px;
  cursor: pointer;
  padding: 6px 12px;
`
