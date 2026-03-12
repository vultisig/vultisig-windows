import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { LockClosedIcon } from '@lib/ui/icons/LockClosedIcon'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AgentChatInput } from './AgentChatInput'

/** Props for the default chat-input mode of the footer. */
type ChatModeProps = {
  mode: 'chat'
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
  isLoading: boolean
  onStop: () => void
  onWalletClick: () => void
}

/** Props for the password-entry mode shown during transaction approval. */
type PasswordModeProps = {
  mode: 'password'
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
  error?: string | null
}

type AgentChatFooterProps = ChatModeProps | PasswordModeProps

/** Footer bar for the agent chat — shows either a message input or a password input for transaction approval. */
export const AgentChatFooter: FC<AgentChatFooterProps> = props => {
  const { t } = useTranslation()

  if (props.mode === 'password') {
    return (
      <Container>
        <VStack gap={12}>
          <Text variant="caption" color="info" centerHorizontally>
            {t('approve_transaction')}
          </Text>
          <NavBar>
            <SideButton onClick={props.onCancel} aria-label={t('cancel')}>
              <IconWrapper>
                <CrossIcon style={{ fontSize: 24 }} />
              </IconWrapper>
            </SideButton>
            <InputWrapper>
              <AgentChatInput
                value={props.value}
                onChange={props.onChange}
                onSubmit={props.onSubmit}
                placeholder={t('enter_vault_password')}
                inputType="password"
                containerHeight={70}
                containerBorderRadius={24}
                actionIcon={<LockClosedIcon style={{ fontSize: 20 }} />}
                actionAriaLabel={t('approve_transaction')}
              />
            </InputWrapper>
          </NavBar>
          {props.error && (
            <Text size={13} color="danger">
              {props.error}
            </Text>
          )}
        </VStack>
      </Container>
    )
  }

  return (
    <Container>
      <NavBar>
        <SideButton onClick={props.onWalletClick} aria-label={t('wallet')}>
          <IconWrapper>
            <WalletIcon />
          </IconWrapper>
        </SideButton>
        <InputWrapper>
          <AgentChatInput
            value={props.value}
            onChange={props.onChange}
            onSubmit={props.onSubmit}
            placeholder={props.placeholder}
            isLoading={props.isLoading}
            onStop={props.onStop}
          />
        </InputWrapper>
      </NavBar>
    </Container>
  )
}

const Container = styled.div`
  padding: 12px 16px;
`

const NavBar = styled(HStack)`
  gap: 8px;
  align-items: center;
  width: 100%;
`

const InputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`

const SideButton = styled(UnstyledButton)`
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 40px;
  color: ${getColor('textShy')};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`
