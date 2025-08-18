import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useResolvePopupCall } from '../core/call'

export const PopupDeadEnd = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()

  const resolvePopupCall = useResolvePopupCall()

  return (
    <>
      <PageContent alignItems="center" justifyContent="center">
        {children}
      </PageContent>
      <PageFooter>
        <Button
          kind="secondary"
          onClick={() => {
            resolvePopupCall({
              error: new Error('User closed the popup at the dead end'),
            })
            window.close()
          }}
        >
          {t('close')}
        </Button>
      </PageFooter>
    </>
  )
}
