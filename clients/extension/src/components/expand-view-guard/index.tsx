import { isPopupView } from '@clients/extension/src/utils/functions'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigation } from '@lib/ui/navigation/state'
import { PageContent } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UAParser } from 'ua-parser-js'

import { useOpenInExpandedViewMutation } from '../../expanded-view/mutations/openInExpandedView'
import { AppView } from '../../navigation/AppView'

export const ExpandViewGuard: FC<ChildrenProp> = ({ children }) => {
  const { t } = useTranslation()
  const { mutate: openInExpandedView } = useOpenInExpandedViewMutation()

  const shouldRedirect = useMemo(() => {
    const parser = new UAParser()
    const parserResult = parser.getResult()

    return parserResult.os.name !== 'Windows' && isPopupView()
  }, [])

  const [{ history }] = useNavigation()
  const currentView = getLastItem(history) as AppView

  useEffect(() => {
    if (shouldRedirect) {
      openInExpandedView(currentView)
    }
  }, [currentView, openInExpandedView, shouldRedirect])

  return shouldRedirect ? (
    <VStack fullHeight>
      <PageContent
        alignItems="center"
        gap={24}
        justifyContent="center"
        flexGrow
        scrollable
      >
        <Text centerHorizontally>{t('continue_in_new_window')}</Text>
      </PageContent>
    </VStack>
  ) : (
    children
  )
}
