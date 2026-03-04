import type { Meta, StoryObj } from '@storybook/react-vite'
import styled from 'styled-components'

import { AgentReplyMessage } from './AgentReplyMessage'

const meta = {
  title: 'Agent/AgentReplyMessage',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta

type Story = StoryObj

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  max-width: 400px;
`

const Label = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #8295ae;
  margin-bottom: -40px;
`

export const BothStates: Story = {
  render: () => (
    <Wrapper>
      <div>
        <Label>Analyzing (pending)</Label>
        <AgentReplyMessage isAnalyzing />
      </div>
      <div>
        <Label>Finished (with response)</Label>
        <AgentReplyMessage
          isAnalyzing={false}
          analysisDuration={9}
          content="I've prepared a swap proposal for you. I found the best route via THORChain with minimal slippage. Please review and approve."
        />
      </div>
    </Wrapper>
  ),
}
