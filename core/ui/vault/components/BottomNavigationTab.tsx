import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

const iconBounceScale = 1.22

type BottomNavigationTabProps = {
  icon: ReactNode
  label: string
  isSelected: boolean
  onClick: () => void
}

/** A bottom navigation tab; its icon bounces as the tab becomes selected. */
export const BottomNavigationTab = ({
  icon,
  label,
  isSelected,
  onClick,
}: BottomNavigationTabProps) => {
  const shouldReduceMotion = useReducedMotion() === true
  const shouldBounce = isSelected && !shouldReduceMotion

  return (
    <TabButton
      $isActive={isSelected}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <motion.span
        initial={false}
        animate={{ scale: shouldBounce ? [1, iconBounceScale, 1] : 1 }}
        transition={{
          duration: 0.59,
          times: [0, 0.24, 1],
          ease: ['easeOut', 'backOut'],
        }}
        style={{ display: 'flex' }}
      >
        {icon}
      </motion.span>
      <Text as="span" size={10}>
        {label}
      </Text>
    </TabButton>
  )
}

const TabButton = styled(UnstyledButton)<{ $isActive: boolean }>`
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 48px;
  padding: 3px 20px;
  font-size: 24px;
  ${borderRadius.pill};
  transition: all 0.2s ease-in-out;
  background: transparent;

  ${vStack({
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  })};

  ${({ $isActive }) =>
    $isActive
      ? css`
          color: ${getColor('contrast')};
        `
      : css`
          color: ${getColor('textShy')};
        `}
`
