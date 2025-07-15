import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useCore } from '@core/ui/state/core'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { isUpdateAvailable } from './core/isUpdateAvailable'
import { useLatestVersionQuery } from './queries/latestVersion'

const FixedWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 350px;
  height: 350px;
  margin: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const CenteredText = styled(Text)`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const DownloadButton = styled(UnstyledButton)`
  margin-left: 8px;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.foreground.toCssValue()};
  color: ${({ theme }) => theme.colors.primary.toCssValue()};
  font-weight: 600;
`

export const CheckUpdatePage = () => {
  const { t } = useTranslation()
  const { openUrl, version } = useCore()
  const latestVersionQuery = useLatestVersionQuery()

  return (
    <PageSlice>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('vaultCheckUpdatePage.title')}
      />

      <FixedWrapper>
        <ProductLogo fontSize={200} />
        <Content>
          <MatchQuery
            value={latestVersionQuery}
            success={latestVersion => {
              if (
                isUpdateAvailable({ current: version, latest: latestVersion })
              ) {
                return (
                  <CenteredText>
                    {t('vaultCheckUpdatePage.newVersionAvailable', {
                      version: latestVersion,
                    })}
                    <DownloadButton
                      onClick={() =>
                        openUrl('https://vultisig.com/download/vultisig')
                      }
                    >
                      {t('vaultCheckUpdatePage.downloadButton')}
                    </DownloadButton>
                  </CenteredText>
                )
              }

              return (
                <>
                  <Text color="contrast" weight={500}>
                    {t('vaultCheckUpdatePage.applicationUpToDate')}
                  </Text>
                  <Text color="contrast" size={14}>
                    {version}
                  </Text>
                </>
              )
            }}
            pending={() => (
              <Text color="contrast" weight={500}>
                {t('vaultCheckUpdatePage.fetchingLatestVersion')}
              </Text>
            )}
            error={error => (
              <Text color="contrast" weight={500}>
                {t('vaultCheckUpdatePage.errorFetchingLatestVersion', {
                  error: extractErrorMsg(error),
                })}
              </Text>
            )}
          />
        </Content>
      </FixedWrapper>
    </PageSlice>
  )
}
