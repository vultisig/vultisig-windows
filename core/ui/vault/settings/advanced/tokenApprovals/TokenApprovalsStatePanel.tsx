import { Button } from '@lib/ui/buttons/Button'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { OnClickProp } from '@lib/ui/props'
import { EmptyState } from '@lib/ui/status/EmptyState/EmptyState'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type TokenApprovalsStatePanelProps = {
  icon: ReactNode
  title: string
  description: string
  onSwitchNetwork: OnClickProp['onClick']
}

/**
 * Full-width message used in place of the approvals list (no approvals on
 * this network, or network not supported), with a shortcut to the network
 * picker.
 */
export const TokenApprovalsStatePanel = ({
  icon,
  title,
  description,
  onSwitchNetwork,
}: TokenApprovalsStatePanelProps) => {
  const { t } = useTranslation()

  return (
    <VStack gap={16} alignItems="center">
      <EmptyState
        icon={
          <IconWrapper size={24} color="buttonHover">
            {icon}
          </IconWrapper>
        }
        title={title}
        description={description}
      />
      <Button kind="secondary" size="sm" onClick={onSwitchNetwork}>
        {t('token_approvals_switch_network')}
      </Button>
    </VStack>
  )
}
