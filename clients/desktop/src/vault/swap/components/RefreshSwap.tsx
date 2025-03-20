import 'react-circular-progressbar/dist/styles.css'

import { useEffect, useState } from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import styled from 'styled-components'

import { HStack } from '../../../lib/ui/layout/Stack'
import { Text } from '../../../lib/ui/text'
import { getColor } from '../../../lib/ui/theme/getters'
import { useRefreshSwapQuoteMutation } from '../mutations/useRefreshSwapQuoteMutation'
import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
const COUNTDOWN_TIME = 60

export const RefreshSwap = () => {
  const { data: swapQuoteData, isPending: isSwapQuotePending } =
    useSwapQuoteQuery()
  const { mutate: refreshQuote } = useRefreshSwapQuoteMutation()
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (swapQuoteData || isSwapQuotePending) {
      setTimeLeft(COUNTDOWN_TIME)
    }
  }, [isSwapQuotePending, swapQuoteData])

  useEffect(() => {
    if (timeLeft === 0) {
      refreshQuote()
      setTimeLeft(COUNTDOWN_TIME)
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, refreshQuote])

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
