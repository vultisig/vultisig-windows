import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { PictureIcon } from '@lib/ui/icons/PictureIcon'
import { ContainImage } from '@lib/ui/images/ContainImage'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { UiProps, ValueProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const Icon = styled(ContainImage)`
  ${sameDimensions('1em')};
`

const Fallback = styled.div`
  ${borderRadius.pill};
  ${sameDimensions('1em')};
  background: ${getColor('mist')};
  ${centerContent};
  color: ${getColor('textShy')};
  svg {
    font-size: 0.44em;
  }
`

type ChainEntityIconProps = Partial<ValueProp<string>> & UiProps

export const ChainEntityIcon = ({ value, ...rest }: ChainEntityIconProps) => {
  return (
    <SafeImage
      src={value}
      render={props => <Icon loading="lazy" {...props} {...rest} />}
      fallback={
        <Fallback {...rest}>
          <PictureIcon />
        </Fallback>
      }
    />
  )
}
