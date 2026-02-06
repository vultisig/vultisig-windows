import { FC } from 'react'

import { ToolCall } from '../types'
import { ToolCallDisplay } from './ToolCallDisplay'

type Props = {
  toolCall: ToolCall
}

export const ToolResultDisplay: FC<Props> = ({ toolCall }) => {
  return <ToolCallDisplay toolCall={toolCall} showOutput />
}
