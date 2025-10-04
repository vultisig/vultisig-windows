import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const PopupDeadEnd = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()

  const { goBack } = useCore()

  return (
    <>
      <PageContent alignItems="center" justifyContent="center">
        {children}
      </PageContent>
      <PageFooter>
        <Button kind="secondary" onClick={goBack}>
          {t('close')}
        </Button>
      </PageFooter>
    </>
  )
}
