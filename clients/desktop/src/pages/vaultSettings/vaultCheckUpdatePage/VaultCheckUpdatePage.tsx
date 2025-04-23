import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useVersion } from '@core/ui/product/state/version'
import { useOpenUrl } from '@core/ui/state/openUrl'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import useVersionCheck from '../../../lib/hooks/useVersionCheck'
import { DOWNLOAD_VULTISIG_LINK } from '../constants'
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

  const localVersion = useVersion()

  const openUrl = useOpenUrl()

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
        <DownloadButton onClick={() => openUrl(DOWNLOAD_VULTISIG_LINK)}>
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
              {localVersion}
            </Text>
          )}
        </Content>
      </FixedWrapper>
    </PageSlice>
  )
}

export default VaultCheckUpdatePage
