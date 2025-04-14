import { useOpenUrl } from '@core/ui/state/openUrl'
import { Button } from '@lib/ui/buttons/Button'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { FilledAlertIcon } from '@lib/ui/icons/FilledAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text, text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { WindowReload } from '../../../wailsjs/runtime/runtime'
import { ErrorState } from './ErrorBoundary'

const reportErrorUrl =
  'https://discord.com/channels/1203844257220395078/1294500829482450944'

const StackTrace = styled.pre`
  ${text({
    family: 'mono',
    size: 12,
    weight: '400',
  })}
`

export const FullSizeErrorFallback = ({ error, info }: ErrorState) => {
  const { t } = useTranslation()

  const openUrl = useOpenUrl()

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('something_went_wrong')}</PageHeaderTitle>}
      />
      <PageContent gap={20}>
        <VStack
          scrollable
          flexGrow
          gap={40}
          alignItems="center"
          justifyContent="center"
        >
          <FilledAlertIcon style={{ fontSize: 66 }} />
          <VStack style={{ maxWidth: 320 }} alignItems="center" gap={8}>
            <Text
              family="mono"
              weight="700"
              size={16}
              color="contrast"
              centerHorizontally
            >
              {extractErrorMsg(error)}
            </Text>
            {info && <StackTrace>{info.componentStack}</StackTrace>}
          </VStack>
        </VStack>
        <UniformColumnGrid gap={20}>
          <Button
            onClick={() => {
              openUrl(reportErrorUrl)
            }}
            kind="outlined"
          >
            {t('report_error')}
          </Button>
          <Button
            onClick={() => {
              WindowReload()
            }}
          >
            {t('try_again')}
          </Button>
        </UniformColumnGrid>
      </PageContent>
    </>
  )
}
