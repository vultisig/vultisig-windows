import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
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
  errorMessage,
  message,
}: FullPageFlowErrorStateProps) => {
  const navigate = useCoreNavigate()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <CloseButton onClick={() => navigate({ id: 'vault' })}>
            <CrossIcon />
          </CloseButton>
        }
        hasBorder
      />
      <FlowErrorPageContent
        action={action}
        message={errorMessage}
        title={message}
      />
    </>
  )
}

const CloseButton = styled(UnstyledButton)`
  font-size: 20px;
`
