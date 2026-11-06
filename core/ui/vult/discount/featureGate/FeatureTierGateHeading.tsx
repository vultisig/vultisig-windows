import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { featureTierGateLooks } from './featureTierGateLooks'

type FeatureTierGateHeadingProps = {
  icon: ReactNode
  title: string
  description: string
  isSettingsLook: boolean
}

/** The gated feature's icon badge, name and explanation. */
export const FeatureTierGateHeading = ({
  icon,
  title,
  description,
  isSettingsLook,
}: FeatureTierGateHeadingProps) => {
  const look = featureTierGateLooks[isSettingsLook ? 'settings' : 'default']

  return (
    <VStack alignItems="center" gap={32} fullWidth>
      <IconBadge $isSettingsLook={isSettingsLook}>{icon}</IconBadge>
      <VStack alignItems="center" gap={16} padding={look.headingPadding}>
        <look.Label centerHorizontally {...look.title}>
          {title}
        </look.Label>
        <look.Label color="shy" centerHorizontally {...look.description}>
          {description}
        </look.Label>
      </VStack>
    </VStack>
  )
}

const IconBadge = styled.div<{ $isSettingsLook: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  ${borderRadius.pill};
  background: #03132c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 18px rgba(12, 78, 255, 0.18);
  font-size: 20px;
  color: #0439c7;

  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      background: ${getColor('settingsBadgeBackground')};
      box-shadow: inset 0 2px 1px rgba(0, 0, 0, 0.25);
      color: ${getColor('buttonNeutral')};
      overflow: hidden;
      position: relative;

      &::after {
        background: ${getColor('buttonPrimary')};
        bottom: -3px;
        content: '';
        filter: blur(9.26px);
        height: 8px;
        left: 11.8px;
        position: absolute;
        width: 15.9px;
      }
    `}
`
