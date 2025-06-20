import 'react-circular-progressbar/dist/styles.css'

import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Seconds } from '@lib/utils/time'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import styled from 'styled-components'

import { useRefreshSwapQuoteInterval } from '../form/hooks/useRefreshSwapQuoteInterval'

const countdownTime: Seconds = 60

export const RefreshSwap = () => {
  const timeLeft = useRefreshSwapQuoteInterval(countdownTime)

  return (
    <Wrapper alignItems="center" gap={6}>
      <Text
        color="supporting"
        size={12}
      >{`0:${timeLeft < 10 ? '0' : ''}${timeLeft}`}</Text>
      <Progress
        strokeWidth={12}
        styles={buildStyles({
          pathColor: '#4879FD',
          trailColor: '#1B3F73',
        })}
        value={timeLeft}
        maxValue={60}
        minValue={0}
      />
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  padding: 8px;
  background-color: ${getColor('foreground')};
  border-radius: 99px;
`

const Progress = styled(CircularProgressbar)`
  height: 16px;
  width: 16px;
`
