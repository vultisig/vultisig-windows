import { useCurrentVaultAppSessionsQuery } from '@core/extension/storage/hooks/appSessions'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { ContainImage } from '@lib/ui/images/ContainImage'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { getColor } from '@lib/ui/theme/getters'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const Icon = styled(ContainImage)`
  ${sameDimensions('36px')};
  ${round};
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const IconContainer = styled.div`
  position: relative;
  ${sameDimensions('36px')};
`

const Badge = styled.div<{ isConnected: boolean }>`
  position: absolute;
  top: -0.15em;
  right: -0.1em;
  width: 1em;
  height: 1em;
  ${round};
  background-color: ${({ isConnected }) =>
    isConnected ? getColor('success') : getColor('idle')};
  border: 4px solid ${getColor('foregroundExtra')};
`

type CurrentTabInfo = {
  favicon?: string
  url?: string
}

const useCurrentTabInfo = () => {
  const [tabInfo, setTabInfo] = useState<CurrentTabInfo | undefined>()

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      return
    }

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) {
        return
      }
      const currentTab = tabs[0]
      if (currentTab && currentTab.favIconUrl && currentTab.url) {
        setTabInfo({
          favicon: currentTab.favIconUrl,
          url: currentTab.url,
        })
      }
    })
  }, [])

  return tabInfo
}

export const DappsButton = () => {
  const navigate = useNavigate()
  const tabInfo = useCurrentTabInfo()
  const { data: sessions = {} } = useCurrentVaultAppSessionsQuery()

  const isConnected = tabInfo?.url
    ? sessions[getUrlBaseDomain(tabInfo.url)] !== undefined
    : false

  return tabInfo ? (
    <IconButton onClick={() => navigate({ id: 'connectedDapps' })}>
      <IconWrapper>
        <IconContainer>
          <SafeImage
            src={tabInfo.favicon}
            render={props => <Icon {...props} />}
          />
          {tabInfo.url && <Badge isConnected={isConnected} />}
        </IconContainer>
      </IconWrapper>
    </IconButton>
  ) : null
}
