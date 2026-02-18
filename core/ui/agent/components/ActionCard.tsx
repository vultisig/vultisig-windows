import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import { Action } from '../types'

type Props = {
  action: Action
  onExecute: (action: Action) => void
}

const actionIcons: Record<string, string> = {
  get_market_price: '\u{1F4C8}',
  get_balances: '\u{1F4B0}',
  get_portfolio: '\u{1F4CA}',
  add_chain: '\u{1F517}',
  add_coin: '\u{1FA99}',
  remove_coin: '\u{274C}',
  remove_chain: '\u{274C}',
  initiate_send: '\u{1F4E4}',
  rename_vault: '\u{270F}\u{FE0F}',
  plugin_install: '\u{1F50C}',
  create_policy: '\u{1F4DD}',
  delete_policy: '\u{1F5D1}\u{FE0F}',
  address_book_add: '\u{1F4D6}',
  address_book_remove: '\u{1F4D6}',
}

export const ActionCard: FC<Props> = ({ action, onExecute }) => {
  const icon = actionIcons[action.type] || '\u{26A1}'

  return (
    <Card onClick={() => onExecute(action)}>
      <HStack gap={12} alignItems="center">
        <IconCircle>{icon}</IconCircle>
        <VStack gap={2}>
          <Text size={14} weight={500}>
            {action.title}
          </Text>
          {action.description && (
            <Text size={12} color="supporting">
              {action.description}
            </Text>
          )}
        </VStack>
      </HStack>
    </Card>
  )
}

const Card = styled(UnstyledButton)`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('mist')};
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: ${getColor('foregroundExtra')};
    border-color: ${getColor('primary')};
  }
`

const IconCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
`
