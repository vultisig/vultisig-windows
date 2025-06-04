import { isPopupView } from '@clients/extension/src/utils/functions'
import { useCore } from '@core/ui/state/core'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UAParser } from 'ua-parser-js'

export const ExpandViewGuard: FC<ChildrenProp> = ({ children }) => {
  const { t } = useTranslation()
  const [expandView, setExpandView] = useState(false)
  const { openUrl } = useCore()

  useEffect(() => {
    const parser = new UAParser()
    const parserResult = parser.getResult()

    if (parserResult.os.name !== 'Windows' && isPopupView()) {
      setExpandView(true)

      openUrl(`chrome-extension://${chrome.runtime.id}/index.html`)
    }
  }, [openUrl])

  return expandView ? (
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
