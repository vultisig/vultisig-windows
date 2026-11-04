import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsHugCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsGlow } from '@core/ui/settings/SettingsGlow'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useCore } from '@core/ui/state/core'
import { VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { desktopDownloadUrl } from '@vultisig/core-config'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { isUpdateAvailable } from './core/isUpdateAvailable'
import { useLatestVersionQuery } from './queries/latestVersion'
import { UpdateLogoTile } from './UpdateLogoTile'

const glowCenterOffset = -20
const logoAboveCenter = 115

export const CheckUpdatePage = () => {
  const { t } = useTranslation()
  const { openUrl, version } = useCore()
  const latestVersionQuery = useLatestVersionQuery()

  return (
    <VStack fullHeight style={{ position: 'relative' }}>
      <SettingsGlow centerOffset={glowCenterOffset} />
      <SettingsPageHeader title={t('vaultCheckUpdatePage.title')} />
      <Status>
        <UpdateLogoTile />
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
                      <StatusTitle>
                        {t('vaultCheckUpdatePage.update_is_available')}
                      </StatusTitle>
                      <StatusVersion>
                        {t('vaultCheckUpdatePage.version', {
                          latestVersion,
                        })}
                      </StatusVersion>
                    </VStack>
                    <SettingsHugCtaButton
                      kind="primary"
                      onClick={() => openUrl(desktopDownloadUrl)}
                    >
                      {t('vaultCheckUpdatePage.downloadButton')}
                    </SettingsHugCtaButton>
                  </VStack>
                )
              }

              return (
                <VStack gap={12} alignItems="center">
                  <StatusTitle>
                    {t('vaultCheckUpdatePage.applicationUpToDate')}
                  </StatusTitle>
                  <StatusVersion>
                    {t('vaultCheckUpdatePage.version', {
                      latestVersion: version,
                    })}
                  </StatusVersion>
                </VStack>
              )
            }}
            pending={() => (
              <StatusTitle>
                {t('vaultCheckUpdatePage.fetchingLatestVersion')}
              </StatusTitle>
            )}
            error={error => (
              <StatusTitle>
                {t('vaultCheckUpdatePage.errorFetchingLatestVersion', {
                  error: extractErrorMsg(error),
                })}
              </StatusTitle>
            )}
          />
        </Content>
      </Status>
    </VStack>
  )
}

// The logo holds this position above the page's middle in every state, so the page does not jump when the query settles.
const Status = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 27.5px;
  left: 50%;
  position: absolute;
  text-align: center;
  top: calc(50% - ${logoAboveCenter}px);
  transform: translateX(-50%);
  width: 265px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const StatusTitle = styled(SettingsBaselineText).attrs({
  as: 'div',
  color: 'contrast',
  height: 20 / 16,
  size: 16,
  weight: 500,
})``

const StatusVersion = styled(SettingsBaselineText).attrs({
  as: 'div',
  color: 'shy',
  height: 18 / 14,
  size: 14,
  weight: 500,
})``
