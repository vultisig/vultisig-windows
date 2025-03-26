import styled from 'styled-components'

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton'
import { centerContent } from '../../../lib/ui/css/centerContent'
import { round } from '../../../lib/ui/css/round'
import { sameDimensions } from '../../../lib/ui/css/sameDimensions'
import { ReverseIcon } from '../../../lib/ui/icons/ReverseIcon'
import { HStack } from '../../../lib/ui/layout/Stack'
import { getColor } from '../../../lib/ui/theme/getters'
import { useFromCoin } from '../state/fromCoin'
import { useToCoin } from '../state/toCoin'

const Wrapper = styled(HStack)`
  background-color: ${getColor('background')};
  border-radius: 25.5px;
  padding: 7px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &::before {
    content: '';
    position: absolute;
    width: 54px;
    top: 0;
    height: 19px;
    border-radius: 50px;
    border: 1px solid ${getColor('foregroundExtra')};
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-bottom: none;
  }

  &::after {
    content: '';
    position: absolute;
    width: 54px;
    bottom: 0px;
    height: 19px;
    border-radius: 50px;
    border: 1px solid ${getColor('foregroundExtra')};
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    border-top: none;
  }
`

const Button = styled(UnstyledButton)`
  ${round};
  ${sameDimensions(40)};
  background: ${getColor('primaryAlt')};
  border: 2px solid ${getColor('background')};
  ${centerContent};
  font-size: 16px;
  color: ${getColor('contrast')};
`

export const ReverseSwap = () => {
  const [fromCoin, setFromCoin] = useFromCoin()
  const [toCoin, setToCoin] = useToCoin()

  return (
    <Wrapper justifyContent="center" alignItems="center">
      <Button
        onClick={() => {
          setFromCoin(toCoin)
          setToCoin(fromCoin)
        }}
      >
        <ReverseIcon />
      </Button>
    </Wrapper>
  )
}
