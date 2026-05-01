import { shouldAlwaysExpand } from '@clients/extension/src/navigation/alwaysExpandViews'
import { isPopupView } from '@clients/extension/src/utils/functions'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigation } from '@lib/ui/navigation/state'
import { PageContent } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useOpenInExpandedViewMutation } from '../../expanded-view/mutations/openInExpandedView'
import { AppView } from '../../navigation/AppView'

const isWindowsOs = () =>
  typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent)

export const ExpandViewGuard: FC<ChildrenProp> = ({ children }) => {
  const { t } = useTranslation()
  const { mutate: openInExpandedView } = useOpenInExpandedViewMutation()

  const [{ history }] = useNavigation()
  const currentView = shouldBePresent(getLastItem(history)) as AppView

  const shouldRedirect = useMemo(() => {
    const alwaysExpand = shouldAlwaysExpand(currentView.id)
    const isPopup = isPopupView()

    if (alwaysExpand && isPopup) {
      return true
    }

    return !isWindowsOs() && isPopup
  }, [currentView.id])

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
