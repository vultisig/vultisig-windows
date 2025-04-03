import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { useAppNavigate } from '@lib/ui/navigation/hooks/useAppNavigate'
import { ActionProp, MessageProp } from '@lib/ui/props'
import styled from 'styled-components'

import { PageHeader } from '../page/PageHeader'
import { PageHeaderBackButton } from '../page/PageHeaderBackButton'
import { FlowErrorPageContent } from './FlowErrorPageContent'

type FullPageFlowErrorStateProps = Partial<ActionProp> &
  MessageProp & {
    errorMessage?: string
  }

export const FullPageFlowErrorState = ({
  action,
  message,
  errorMessage,
}: FullPageFlowErrorStateProps) => {
  const navigate = useAppNavigate()
  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <CloseButton onClick={() => navigate('vault')}>
            <CloseIcon />
          </CloseButton>
        }
      />
      <FlowErrorPageContent
        action={action}
        title={message}
        message={errorMessage}
      />
    </>
  )
}

const CloseButton = styled(UnstyledButton)`
  font-size: 20px;
`
