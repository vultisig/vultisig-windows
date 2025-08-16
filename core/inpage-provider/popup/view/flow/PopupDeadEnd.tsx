import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { finishPopupFlow } from './core/finish'

export const PopupDeadEnd = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()

  return (
    <>
      <PageContent alignItems="center" justifyContent="center">
        {children}
      </PageContent>
      <PageFooter>
        <Button
          kind="secondary"
          onClick={() =>
            finishPopupFlow({ error: new Error('Popup flow reached dead end') })
          }
        >
          {t('close')}
        </Button>
      </PageFooter>
    </>
  )
}
