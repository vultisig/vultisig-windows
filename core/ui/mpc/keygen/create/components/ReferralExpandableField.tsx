import { useFriendReferralValidation } from '@core/ui/vault/settings/referral/components/EditFriendReferralForm/hooks/useFriendReferralValidation'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ClearableTextInput } from './ClearableTextInput'

const ExpandableHeader = styled(HStack)`
  cursor: pointer;
  user-select: none;
`

type ReferralExpandableFieldProps = {
  value: string
  onValueChange: (value: string) => void
}

export const ReferralExpandableField = ({
  value,
  onValueChange,
}: ReferralExpandableFieldProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const error = useFriendReferralValidation(value)

  return (
    <VStack gap={12}>
      <ExpandableHeader
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <Text color="shy" size={14}>
          {t('add_friends_referral')}
        </Text>
        <CollapsableStateIndicator isOpen={isExpanded} />
      </ExpandableHeader>
      {isExpanded && (
        <VStack gap={8}>
          <ClearableTextInput
            placeholder={t('enter_up_to_4_characters_placeholder')}
            value={value}
            onValueChange={onValueChange}
            onClear={() => onValueChange('')}
            validation={error ? 'invalid' : undefined}
          />
          {error && (
            <Text color="danger" size={12}>
              {error}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  )
}
