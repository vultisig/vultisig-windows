import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import {
  FlowErrorPageContent,
  FlowErrorPageContentProps,
} from '@lib/ui/flow/FlowErrorPageContent'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import styled from 'styled-components'

export const FullPageFlowErrorState = (props: FlowErrorPageContentProps) => {
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
      <FlowErrorPageContent {...props} />
    </>
  )
}

const CloseButton = styled(UnstyledButton)`
  font-size: 20px;
`
