import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { ChildrenProp, OnCloseProp, TitleProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type AdvancedSheetProps = ChildrenProp &
  OnCloseProp &
  TitleProp & {
    onConfirm?: () => void
    leftIcon?: ReactNode
  }

/**
 * Shared frame for every Advanced Swap sub-sheet. Renders the dark modal
 * surface, the X (close) / title / ✓ (confirm) header, and inherits the
 * ResponsiveModal slide-up animation. Keep all sub-sheets on this frame so
 * they stay visually consistent.
 */
export const AdvancedSheet = ({
  title,
  onClose,
  onConfirm,
  leftIcon,
  children,
}: AdvancedSheetProps) => (
  <ResponsiveModal
    isOpen
    onClose={onClose}
    modalProps={{ withDefaultStructure: false }}
  >
    <Wrapper gap={20}>
      <HStack alignItems="center" justifyContent="space-between" gap={12}>
        <IconButton kind="secondary" size="lg" onClick={onClose}>
          {leftIcon ?? <CrossIcon />}
        </IconButton>
        <Text
          size={16}
          weight={500}
          color="contrast"
          style={{ flex: 1, textAlign: 'center' }}
        >
          {title}
        </Text>
        <IconButton kind="primary" size="lg" onClick={onConfirm ?? onClose}>
          <CheckIcon />
        </IconButton>
      </HStack>
      {children}
    </Wrapper>
  </ResponsiveModal>
)

const Wrapper = styled(VStack)`
  width: 100%;
  background: ${getColor('background')};
  ${borderRadius.m};
  padding: 20px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: min(420px, 100% - 32px);
  }
`
