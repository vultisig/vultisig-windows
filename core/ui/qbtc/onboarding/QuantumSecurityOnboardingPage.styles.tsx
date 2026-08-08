import { vStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const heroImageUrl = '/core/images/qbtc-onboarding-hero.png'

export const PageBody = styled.div`
  ${vStack({ gap: 32, alignItems: 'stretch' })};
  padding: 16px 8px 24px;
`

export const TitleStack = styled.div`
  ${vStack({ gap: 14 })};
`

export const HeroFrame = styled.div`
  width: 100%;
  max-width: 350px;
  aspect-ratio: 350 / 240;
  align-self: center;
  border-radius: 8px;
  border: 1px dashed ${getColor('foregroundExtra')};
  background-image: url('${heroImageUrl}');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
`

export const FeatureList = styled.div`
  ${vStack({ gap: 16 })};
`

export const FeatureIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  font-size: 20px;
  color: ${getColor('text')};
`

export const FeatureText = styled.div`
  ${vStack({ gap: 8 })};
  padding-top: 2px;
  flex-grow: 1;
`
