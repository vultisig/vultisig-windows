import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useCancelPopupCall } from '../core/call'

export const PopupDeadEnd = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()

  const cancelPopupCall = useCancelPopupCall()

  return (
    <>
      <PageContent alignItems="center" justifyContent="center">
        {children}
      </PageContent>
      <PageFooter>
        <Button
          kind="secondary"
          onClick={() => {
            cancelPopupCall()
            window.close()
          }}
        >
          {t('close')}
        </Button>
      </PageFooter>
    </>
  )
}
