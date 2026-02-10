import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { interactive } from '@lib/ui/css/interactive'
import { FormCheckBadge } from '@lib/ui/form/FormCheckBadge'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type CollapsedFormFieldProps = {
  title: string
  valuePreview?: ReactNode
  isValid: boolean
  onClick: () => void
  onCollapsedFocus?: () => void
}

export const CollapsedFormField = ({
  title,
  valuePreview,
  isValid,
  onClick,
  onCollapsedFocus,
}: CollapsedFormFieldProps) => {
  const handleFocus = () => {
    onCollapsedFocus?.()
  }

  return (
    <Container type="button" onClick={onClick} onFocus={handleFocus}>
      <HStack gap={12} alignItems="center">
        <Text size={14} color="contrast">
          {title}
        </Text>
        {valuePreview && (
          <Text size={12} color="shy">
            {valuePreview}
          </Text>
        )}
      </HStack>
      <IconsWrapper gap={12} alignItems="center">
        {isValid && (
          <>
            <FormCheckBadge />
            <PencilIconWrapper>
              <PencilIcon />
            </PencilIconWrapper>
          </>
        )}
      </IconsWrapper>
    </Container>
  )
}

const Container = styled(UnstyledButton)`
  width: 100%;
  text-align: left;
  ${interactive};
  gap: 16px;
  padding: 12px;
  flex: 1;
  ${borderRadius.m};
  border: 1px solid ${getColor('foregroundSuper')};
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
  cursor: pointer;
`

const IconsWrapper = styled(HStack)`
  font-size: 16px;
`

const PencilIconWrapper = styled.div`
  color: ${getColor('contrast')};
  display: flex;
  align-items: center;
`
