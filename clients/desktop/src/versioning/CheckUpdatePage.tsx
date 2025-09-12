import { desktopDownloadUrl } from '@core/config'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { isUpdateAvailable } from './core/isUpdateAvailable'
import { useLatestVersionQuery } from './queries/latestVersion'

export const CheckUpdatePage = () => {
  const { t } = useTranslation()
  const { openUrl, version } = useCore()
  const latestVersionQuery = useLatestVersionQuery()

  return (
    <PageSlice>
      <Overlay />
      <HeaderWrapper
        primaryControls={<PageHeaderBackButton />}
        title={t('vaultCheckUpdatePage.title')}
      />
      <FixedWrapper>
        <ProductLogo fontSize={72} />
        <Content>
          <MatchQuery
            value={latestVersionQuery}
            success={(latestVersion = '13.1.1') => {
              if (
                isUpdateAvailable({ current: version, latest: latestVersion })
              ) {
                return (
                  <VStack gap={30} alignItems="center">
                    <VStack gap={12} alignItems="center">
                      <CenteredText>
                        {t('vaultCheckUpdatePage.update_is_available')}
                      </CenteredText>
                      <CenteredText color="shy" size={14}>
                        {t('vaultCheckUpdatePage.version', {
                          latestVersion,
                        })}
                      </CenteredText>
                    </VStack>
                    <DownloadButton
                      kind="primary"
                      onClick={() => openUrl(desktopDownloadUrl)}
                    >
                      {t('vaultCheckUpdatePage.downloadButton')}
                    </DownloadButton>
                  </VStack>
                )
              }

              return (
                <VStack gap={12} alignItems="center">
                  <Text color="contrast" weight={500} size={16}>
                    {t('vaultCheckUpdatePage.applicationUpToDate')}
                  </Text>
                  <Text color="shy" size={14}>
                    {t('vaultCheckUpdatePage.version', {
                      latestVersion: version,
                    })}
                  </Text>
                </VStack>
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

const HeaderWrapper = styled(PageHeader)``

const FixedWrapper = styled.div`
  position: fixed;
  inset: 0;
  margin: auto;
  z-index: -1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 34px;
`

const Overlay = styled(VStack)`
  position: fixed;
  inset: 0;
  z-index: -1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 416px;
    background: linear-gradient(
      82deg,
      rgba(51, 230, 191, 0.15) 8.02%,
      rgba(4, 57, 199, 0.15) 133.75%
    );
    filter: blur(126.94499969482422px);
    opacity: 0.5;
    z-index: -1;
  }
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

const DownloadButton = styled(Button)`
  padding: 14px 32px;
  border-radius: 99px;
  background-color: ${getColor('buttonPrimary')};
  font-weight: 600;
  font-size: 14px;
  max-width: 148px;
`
