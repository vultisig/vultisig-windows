import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { EmptyState } from '@lib/ui/status/EmptyState/EmptyState'
import { ReactNode } from 'react'

type TokenApprovalsStatePanelProps = {
  icon: ReactNode
  title: string
  description: string
}

/** Full-width message used in place of the approvals list. */
export const TokenApprovalsStatePanel = ({
  icon,
  title,
  description,
}: TokenApprovalsStatePanelProps) => (
  <EmptyState
    icon={
      <IconWrapper size={24} color="buttonHover">
        {icon}
      </IconWrapper>
    }
    title={title}
    description={description}
  />
)
