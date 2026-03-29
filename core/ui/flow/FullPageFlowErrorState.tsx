import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { PageHeader } from '@lib/ui/page/PageHeader'
import styled from 'styled-components'

import { useFlowErrorClose } from './FlowErrorCloseContext'
import {
  FlowErrorPageContent,
  FlowErrorPageContentProps,
} from './FlowErrorPageContent'

export const FullPageFlowErrorState = (props: FlowErrorPageContentProps) => {
  const navigate = useCoreNavigate()
  const onClose = useFlowErrorClose()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <CloseButton onClick={onClose ?? (() => navigate({ id: 'vault' }))}>
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
