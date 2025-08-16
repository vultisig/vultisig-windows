import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { finishPopupFlow } from './core/finish'

export const PopupDeadEnd = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()

  return (
    <PageContent>
      <VStack flexGrow alignItems="center" justifyContent="center">
        {children}
      </VStack>
      <Button
        kind="secondary"
        onClick={() =>
          finishPopupFlow({ error: new Error('Popup flow reached dead end') })
        }
      >
        {t('close')}
      </Button>
    </PageContent>
  )
}
