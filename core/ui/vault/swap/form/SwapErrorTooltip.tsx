import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  offset,
  Placement,
  ReferenceType,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { NavigationXIcon } from '@lib/ui/icons/NavigationXIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { ReactNode, useRef } from 'react'
import styled from 'styled-components'

type RenderOpenerProps = {
  ref: (node: ReferenceType | null) => void
} & Record<string, unknown>

type SwapErrorTooltipProps = {
  content?: string | null
  renderOpener: (props: RenderOpenerProps) => ReactNode
  placement?: Placement
  onClose?: () => void
}

const Container = styled.div`
  border-radius: 12px;
  background: #ffffff;
  padding: 12px;
  min-width: 200px;
  max-width: 320px;
`

const Arrow = styled(FloatingArrow)`
  fill: #ffffff;
`

const StyledIconButton = styled(IconButton)`
  color: #718096;
  font-size: 16px;
  width: 20px;
  height: 20px;
  min-width: 20px;
`

export const SwapErrorTooltip = ({
  content,
  renderOpener,
  placement = 'top',
  onClose,
}: SwapErrorTooltipProps) => {
  const isOpen = !!content
  const arrowRef = useRef(null)

  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    open: isOpen,
    placement,
    middleware: [
      offset(12),
      flip(),
      shift(),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const { styles: transitionStyles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
    },
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
    role,
  ])

  return (
    <>
      {renderOpener({ ref: setReference, ...getReferenceProps() })}
      {isOpen && (
        <div
          ref={setFloating}
          style={{ ...floatingStyles, zIndex: 1 }}
          {...getFloatingProps()}
        >
          <Container style={transitionStyles}>
            <Arrow tipRadius={2} height={8} ref={arrowRef} context={context} />
            <VStack gap={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  style={{
                    color: '#02122B',
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: '24px',
                  }}
                >
                  Error
                </Text>
                <StyledIconButton onClick={onClose} size="xs">
                  <NavigationXIcon />
                </StyledIconButton>
              </HStack>
              <Text
                style={{
                  color: '#8295AE',
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: '18px',
                  letterSpacing: '0.06px',
                }}
              >
                {content}
              </Text>
            </VStack>
          </Container>
        </div>
      )}
    </>
  )
}
