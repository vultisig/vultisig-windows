import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CubeWithCornersIcon } from '@lib/ui/icons/CubeWithCornersIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { DescriptionProp, KindProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { matchColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

type ScanResultHeaderKind = 'positive' | 'negative'

type ScanResultHeaderProps = TitleProp &
  DescriptionProp &
  KindProp<ScanResultHeaderKind>

const StyledIconWrapper = styled.div<KindProp<ScanResultHeaderKind>>`
  ${round};
  color: ${matchColor('kind', {
    positive: 'primary',
    negative: 'danger',
  })};

  background: ${({ kind, theme: { colors } }) =>
    kind === 'positive'
      ? colors.primary.getVariant({ a: () => 0.12 }).toCssValue()
      : colors.dangerBackground.toCssValue()};

  border: 2px solid
    ${({ kind, theme: { colors } }) =>
      kind === 'positive'
        ? colors.primary.getVariant({ a: () => 0.25 }).toCssValue()
        : colors.danger.getVariant({ a: () => 0.25 }).toCssValue()};

  font-size: 26px;
  ${sameDimensions(48)};
  ${centerContent};
`

export const ScanResultHeader = ({
  kind,
  title,
  description,
}: ScanResultHeaderProps) => (
  <VStack alignItems="center" gap={24}>
    <StyledIconWrapper kind={kind}>
      <CubeWithCornersIcon />
    </StyledIconWrapper>
    <VStack alignItems="center" gap={8}>
      <Text centerHorizontally color="contrast" size={22} weight={500}>
        {title}
      </Text>
      <Text centerHorizontally color="supporting" size={13}>
        {description}
      </Text>
    </VStack>
  </VStack>
)
