import { getVaultId } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@lib/utils/attempt'
import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentService } from '../hooks/useAgentService'
import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { PasswordPrompt } from './PasswordPrompt'

export const ConnectionButton: FC = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const vaultId = vault ? getVaultId(vault) : null
  const { orchestrator } = useAgentService()
  const { state, checked, connect, disconnect, error, clearError } =
    useConnectionStatus(vaultId, orchestrator)
  const [showPassword, setShowPassword] = useState(false)
  const autoPromptedRef = useRef(false)

  useEffect(() => {
    if (checked && state === 'disconnected' && !autoPromptedRef.current) {
      autoPromptedRef.current = true
      setShowPassword(true)
    }
  }, [checked, state])

  const handleClick = () => {
    if (state === 'disconnected') {
      clearError()
      setShowPassword(true)
    } else if (state === 'connected') {
      disconnect()
    }
  }

  const handlePasswordSubmit = async (password: string) => {
    const result = await attempt(() => connect(password))
    if ('data' in result) {
      setShowPassword(false)
    }
  }

  const handlePasswordCancel = () => {
    setShowPassword(false)
    clearError()
  }

  return (
    <>
      <StyledButton onClick={handleClick} $state={state}>
        {state === 'connected' && <CheckIcon />}
        <Text size={12}>
          {state === 'disconnected' && t('agent_connect_now')}
          {state === 'connecting' && t('agent_connecting')}
          {state === 'connected' && t('agent_connected')}
        </Text>
      </StyledButton>
      {showPassword && (
        <PasswordPrompt
          toolName="sign_in"
          operation={t('agent_operation_sign_in')}
          description={t('agent_connect_description')}
          error={error}
          isLoading={state === 'connecting'}
          onSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
        />
      )}
    </>
  )
}

const StyledButton = styled(UnstyledButton)<{
  $state: 'disconnected' | 'connecting' | 'connected'
}>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${getColor('foreground')};
  color: ${({ $state, theme }) =>
    $state === 'connected' ? theme.colors.success.toCssValue() : 'inherit'};
  font-size: 12px;
  cursor: ${({ $state }) => ($state === 'connecting' ? 'default' : 'pointer')};

  &:hover {
    background: ${({ $state }) =>
      $state === 'connecting' ? 'none' : undefined};
  }
`
