import { getVaultId } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useState } from 'react'
import styled from 'styled-components'

import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { PasswordPrompt } from './PasswordPrompt'

export const ConnectionButton: FC = () => {
  const vault = useCurrentVault()
  const vaultId = vault ? getVaultId(vault) : null
  const { state, connect, disconnect, error, clearError } =
    useConnectionStatus(vaultId)
  const [showPassword, setShowPassword] = useState(false)

  const handleClick = () => {
    if (state === 'disconnected') {
      clearError()
      setShowPassword(true)
    } else if (state === 'connected') {
      disconnect()
    }
  }

  const handlePasswordSubmit = async (password: string) => {
    try {
      await connect(password)
      setShowPassword(false)
    } catch {
      // error is shown inside the modal via the error prop
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
          {state === 'disconnected' && 'Connect now'}
          {state === 'connecting' && 'Connecting...'}
          {state === 'connected' && 'Connected'}
        </Text>
      </StyledButton>
      {showPassword && (
        <PasswordPrompt
          toolName="sign_in"
          operation="sign in"
          description="Enter your vault password to connect to the agent. Your password is used to sign an authentication message."
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
  color: ${({ $state }) => ($state === 'connected' ? '#33e6bf' : 'inherit')};
  font-size: 12px;
  cursor: ${({ $state }) => ($state === 'connecting' ? 'default' : 'pointer')};

  &:hover {
    background: ${({ $state }) =>
      $state === 'connecting' ? 'none' : undefined};
  }
`
