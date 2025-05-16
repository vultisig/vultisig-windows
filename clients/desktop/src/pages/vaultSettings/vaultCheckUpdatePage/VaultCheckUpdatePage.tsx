import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useCore } from '@core/ui/state/core'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import useVersionCheck from '../../../lib/hooks/useVersionCheck'
import {
  CenteredText,
  Content,
  DownloadButton,
  FixedWrapper,
} from './VaultCheckUpdatePage.styles'

const VaultCheckUpdatePage = () => {
  const { t } = useTranslation()
  const { latestVersion, updateAvailable, remoteError, isLoading } =
    useVersionCheck()

  const { openUrl, version } = useCore()

  let content: ReactNode

  if (remoteError) {
    content = t('vaultCheckUpdatePage.errorFetchingLatestVersion', {
      error: extractErrorMsg(remoteError),
    })
  } else if (isLoading) {
    content = t('vaultCheckUpdatePage.fetchingLatestVersion')
  } else if (!updateAvailable) {
    content = t('vaultCheckUpdatePage.applicationUpToDate')
  } else if (updateAvailable) {
    content = (
      <CenteredText>
        {t('vaultCheckUpdatePage.newVersionAvailable', { latestVersion })}
        <DownloadButton
          onClick={() => openUrl('https://vultisig.com/download/vultisig')}
        >
          {t('vaultCheckUpdatePage.downloadButton')}
        </DownloadButton>
      </CenteredText>
    )
  }

  return (
    <PageSlice>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('vaultCheckUpdatePage.title')}
      />

      <FixedWrapper>
        <ProductLogo fontSize={200} />
        <Content>
          <Text color="contrast" weight={500}>
            {content}
          </Text>
          {!updateAvailable && (
            <Text color="contrast" size={14}>
              {version}
            </Text>
          )}
        </Content>
      </FixedWrapper>
    </PageSlice>
  )
}

export default VaultCheckUpdatePage
