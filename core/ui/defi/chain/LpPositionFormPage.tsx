import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const LpPositionFormPage = () => {
  const [{ action, positionId }] = useCoreViewState<'lpPositionForm'>()
  const { goBack } = useCore()
  const { t } = useTranslation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={t('defi_lp_position_form_title', {
          action,
        })}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
        <VStack gap={8}>
          <Text size={20} weight="700" color="contrast">
            {t('coming_soon')}
          </Text>
          <Text size={14} color="shy">
            {t('defi_lp_position_form_description', {
              action,
              position: positionId,
            })}
          </Text>
        </VStack>
      </PageContent>
    </VStack>
  )
}
