import { ReactNode } from 'react'

import { textInputHorizontalPadding } from '../../css/textInput'
import { IconWrapper } from '../../icons/IconWrapper'
import { HStack } from '../../layout/Stack'
import { Text } from '../../text'
import { dropdownInputConfig } from './config'

interface DropdownOptionContentProps {
  identifier: ReactNode
  name: ReactNode
}

export const DropdownOptionContent = ({
  identifier,
  name,
}: DropdownOptionContentProps) => (
  <HStack alignItems="center" gap={textInputHorizontalPadding}>
    <IconWrapper style={{ fontSize: dropdownInputConfig.identifierSize }}>
      {identifier}
    </IconWrapper>
    <Text as="div" cropped>
      {name}
    </Text>
  </HStack>
)
