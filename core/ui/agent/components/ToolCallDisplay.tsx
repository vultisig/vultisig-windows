import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ToolCall } from '../types'
import { formatToolName } from '../utils/formatToolName'
import { ToolOutputRenderer } from './tool-outputs'

const progressPattern = /^(\d+)%\s+(.+)$/

const parseProgress = (
  progress: string
): { percent: number; message: string } | null => {
  const match = progress.match(progressPattern)
  if (!match) return null
  return { percent: parseInt(match[1], 10), message: match[2] }
}

type Props = {
  toolCall: ToolCall
  showOutput?: boolean
}

const toolDescriptions: Record<string, string> = {
  plugin_list: 'Discovering available plugins',
  plugin_spec: 'Checking plugin capabilities',
  plugin_installed: 'Checking installation status',
  plugin_install: 'Installing plugin',
  asset_lookup: 'Looking up asset information',
  vault_info: 'Getting vault information',
  list_vaults: 'Listing vaults',
  get_chain_address: 'Getting address',
  get_chains: 'Getting chains',
  get_coins: 'Getting coins',
  get_balances: 'Getting balances',
  get_address_book: 'Getting address book',
  add_coin: 'Adding coin',
  remove_coin: 'Removing coin',
  add_address_book_entry: 'Adding address',
  remove_address_book_entry: 'Removing address',
  rename_vault: 'Renaming vault',
  policy_list: 'Listing policies',
  policy_generate: 'Generating policy configuration',
  policy_add: 'Submitting policy',
  policy_delete: 'Deleting policy',
  policy_status: 'Checking policy status',
  transaction_history: 'Getting transaction history',
}

const toolsWithCustomOutput = new Set([
  'get_chain_address',
  'get_chains',
  'get_coins',
  'get_balances',
  'vault_info',
  'list_vaults',
  'get_address_book',
  'add_coin',
  'remove_coin',
  'add_address_book_entry',
  'remove_address_book_entry',
  'rename_vault',
  'plugin_list',
  'plugin_spec',
  'plugin_install',
  'plugin_installed',
  'policy_list',
  'policy_add',
  'policy_delete',
  'policy_status',
  'policy_generate',
  'asset_lookup',
  'initiate_send',
  'initiate_swap',
  'transaction_history',
])

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export const ToolCallDisplay: FC<Props> = ({
  toolCall,
  showOutput = false,
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded(prev => !prev), [])

  const description =
    toolDescriptions[toolCall.name] ||
    `Running ${formatToolName(toolCall.name)}`
  const isRunning = toolCall.status === 'running'
  const isError = toolCall.status === 'error'
  const isComplete = toolCall.status === 'complete'
  const hasCustomOutput =
    isComplete &&
    toolCall.output !== undefined &&
    toolsWithCustomOutput.has(toolCall.name)

  if (showOutput && hasCustomOutput) {
    return (
      <VStack gap={8}>
        <CompactHeader>
          <HStack gap={8} alignItems="center">
            <StatusIcon>
              <IconWrapper size={12}>
                <CheckIcon />
              </IconWrapper>
            </StatusIcon>
            <Text size={12} color="supporting">
              {description}
            </Text>
          </HStack>
        </CompactHeader>
        <ToolOutputRenderer toolName={toolCall.name} output={toolCall.output} />
      </VStack>
    )
  }

  return (
    <Container onClick={toggleExpanded}>
      <HStack gap={8} alignItems="center">
        <StatusIcon>
          {isRunning ? (
            <Spinner />
          ) : isError ? (
            <Text color="danger" size={12}>
              ✗
            </Text>
          ) : (
            <IconWrapper size={12}>
              <CheckIcon />
            </IconWrapper>
          )}
        </StatusIcon>
        <VStack gap={2} flexGrow>
          <Text size={12} color="supporting">
            {description}
          </Text>
          {isRunning && toolCall.progress && (
            <ProgressDisplay progress={toolCall.progress} />
          )}
          {isError && toolCall.error && (
            <Text size={11} color="danger">
              {toolCall.error}
            </Text>
          )}
        </VStack>
        {showOutput && <ExpandIcon $expanded={expanded}>▸</ExpandIcon>}
      </HStack>
      {showOutput && expanded && (
        <ExpandedContent>
          <VStack gap={8}>
            <div>
              <Text size={11} color="supporting" weight={600}>
                Input:
              </Text>
              <CodeBlock>
                <Text size={10} color="supporting">
                  {safeStringify(toolCall.input)}
                </Text>
              </CodeBlock>
            </div>
            {toolCall.output !== undefined && (
              <div>
                <Text size={11} color="supporting" weight={600}>
                  Output:
                </Text>
                <CodeBlock>
                  <Text size={10} color="supporting">
                    {safeStringify(toolCall.output)}
                  </Text>
                </CodeBlock>
              </div>
            )}
          </VStack>
        </ExpandedContent>
      )}
    </Container>
  )
}

const ProgressDisplay: FC<{ progress: string }> = ({ progress }) => {
  const parsed = useMemo(() => parseProgress(progress), [progress])

  if (!parsed) {
    return (
      <Text size={11} color="shy">
        {progress}
      </Text>
    )
  }

  return (
    <VStack gap={4}>
      <HStack gap={6} alignItems="center">
        <ProgressBarTrack>
          <ProgressBarFill style={{ width: `${parsed.percent}%` }} />
        </ProgressBarTrack>
        <Text
          size={11}
          color="shy"
          style={{ minWidth: 32, textAlign: 'right' }}
        >
          {parsed.percent}%
        </Text>
      </HStack>
      <Text size={11} color="shy">
        {parsed.message}
      </Text>
    </VStack>
  )
}

const ProgressBarTrack = styled.div`
  flex: 1;
  height: 4px;
  background: ${getColor('mist')};
  border-radius: 2px;
  overflow: hidden;
`

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${getColor('primary')};
  border-radius: 2px;
  transition: width 0.3s ease;
`

const Container = styled.div`
  padding: 8px 12px;
  background: ${getColor('foreground')};
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid ${getColor('mist')};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const StatusIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ExpandIcon = styled.span<{ $expanded: boolean }>`
  font-size: 10px;
  color: ${getColor('textSupporting')};
  transform: rotate(${({ $expanded }) => ($expanded ? '90deg' : '0deg')});
  transition: transform 0.2s ease;
`

const ExpandedContent = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${getColor('mist')};
`

const CodeBlock = styled.pre`
  margin: 4px 0 0;
  padding: 8px;
  background: ${getColor('background')};
  border-radius: 4px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
`

const CompactHeader = styled.div`
  padding: 4px 0;
`
