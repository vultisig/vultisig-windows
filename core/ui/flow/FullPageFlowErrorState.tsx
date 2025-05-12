import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { ActionProp, MessageProp } from '@lib/ui/props'
import styled from 'styled-components'

type FullPageFlowErrorStateProps = Partial<ActionProp> &
  MessageProp & {
    errorMessage?: string
  }

export const FullPageFlowErrorState = ({
  action,
  message,
  errorMessage,
}: FullPageFlowErrorStateProps) => {
  const navigate = useCoreNavigate()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <CloseButton onClick={() => navigate({ id: 'vault' })}>
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
