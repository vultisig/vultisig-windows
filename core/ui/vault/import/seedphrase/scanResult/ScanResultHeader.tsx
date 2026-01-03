import { CubeWithCornersIcon } from '@lib/ui/icons/CubeWithCornersIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { DescriptionProp, KindProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { matchColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

type ScanResultHeaderKind = 'positive' | 'negative'

type ScanResultHeaderProps = TitleProp &
  DescriptionProp &
  KindProp<ScanResultHeaderKind>

const StyledIconWrapper = styled(IconWrapper)<KindProp<ScanResultHeaderKind>>`
  color: ${matchColor('kind', {
    positive: 'primary',
    negative: 'danger',
  })};
`

export const ScanResultHeader = ({
  kind,
  title,
  description,
}: ScanResultHeaderProps) => (
  <VStack alignItems="center" gap={24}>
    <StyledIconWrapper size={48} kind={kind}>
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
