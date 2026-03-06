import { getVaultId } from '@core/mpc/vault/Vault'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentService } from '../hooks/useAgentService'
import { VerticalDotsIcon } from '../icons/VerticalDotsIcon'

const discordFeedbackUrl =
  'https://discord.com/channels/1203844257220395078/1262152019242651840'

type AgentChatMenuProps = {
  conversationId: string | null
  onSessionDeleted: () => void
}

export const AgentChatMenu: FC<AgentChatMenuProps> = ({
  conversationId,
  onSessionDeleted,
}) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const { deleteConversation } = useAgentService()
  const vault = useCurrentVault()
  const vaultId = vault ? getVaultId(vault) : null
  const [isOpen, setIsOpen] = useState(false)

  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-end',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'menu' })

  const { styles: transitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0, transform: 'scale(0.95)' },
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ])

  const handleGiveFeedback = () => {
    setIsOpen(false)
    openUrl(discordFeedbackUrl)
  }

  const handleDeleteSession = async () => {
    setIsOpen(false)
    if (conversationId && vaultId) {
      try {
        await deleteConversation(conversationId, vaultId)
      } catch {
        // best-effort deletion
      }
    }
    onSessionDeleted()
  }

  return (
    <>
      <MenuTrigger
        ref={setReference}
        aria-label={t('agent_chat_options')}
        {...getReferenceProps()}
      >
        <VerticalDotsIcon />
      </MenuTrigger>
      {isOpen && (
        <MenuContainer
          ref={setFloating}
          style={{ ...floatingStyles, zIndex: 10 }}
          {...getFloatingProps()}
        >
          <MenuPanel style={transitionStyles}>
            <MenuItem
              role="menuitem"
              type="button"
              onClick={handleGiveFeedback}
            >
              <HStack alignItems="center" gap={8}>
                <CircleAlertIcon style={{ fontSize: 24 }} />
                <Text size={15} weight={500}>
                  {t('agent_give_feedback')}
                </Text>
              </HStack>
            </MenuItem>
            {conversationId && (
              <MenuItem
                $danger
                role="menuitem"
                type="button"
                onClick={handleDeleteSession}
              >
                <HStack alignItems="center" gap={8}>
                  <TrashIcon style={{ fontSize: 24, color: 'inherit' }} />
                  <Text size={15} weight={500} color="danger">
                    {t('agent_delete_chat_session')}
                  </Text>
                </HStack>
              </MenuItem>
            )}
          </MenuPanel>
        </MenuContainer>
      )}
    </>
  )
}

const MenuTrigger = styled(UnstyledButton)`
  ${sameDimensions(24)};
  ${centerContent};
  flex-shrink: 0;
  font-size: 24px;
  color: ${getColor('contrast')};
  border-radius: 4px;

  &:hover {
    opacity: 0.7;
  }
`

const MenuContainer = styled.div``

const MenuPanel = styled(VStack)`
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  padding: 4px 0;
  min-width: 220px;
`

const MenuItem = styled.button<{ $danger?: boolean }>`
  all: unset;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  color: ${({ $danger }) =>
    $danger ? getColor('danger') : getColor('contrast')};
  border-radius: 12px;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`
