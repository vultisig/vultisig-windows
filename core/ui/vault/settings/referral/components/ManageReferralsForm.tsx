import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import {
  useFriendReferralQuery,
  useSetFriendReferralMutation,
} from '@core/ui/storage/referrals'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@lib/utils/attempt'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useFriendReferralValidation } from './EditFriendReferralForm/hooks/useFriendReferralValidation'
import { FormFieldErrorText } from './Referrals.styled'

export const ManageReferralsForm = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const vaultId = useAssertCurrentVaultId()
  const navigate = useCoreNavigate()
  const { data: friendReferral, isLoading: isFriendReferralLoading } =
    useFriendReferralQuery(vaultId)
  const { mutateAsync: setFriendReferral } =
    useSetFriendReferralMutation(vaultId)
  const { getClipboardText } = useCore()
  const error = useFriendReferralValidation(value)
  const disabled = friendReferral
    ? false
    : Boolean(error) || value.trim().length === 0

  const handlePaste = async () => {
    const { data } = await attempt(getClipboardText)

    if (data) setValue(data)
  }

  const handleSave = () => {
    const newFriendReferral = value.trim()

    if (isFriendReferralLoading) return

    if (friendReferral) {
      onFinish()
      return
    }

    if (newFriendReferral) {
      setFriendReferral(newFriendReferral)
    }
  }

  useEffect(() => {
    if (friendReferral) setValue(friendReferral)
  }, [friendReferral])

  return (
    <>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate({ id: 'referral' })} />
        }
        title={t('manage_referral_title')}
      />
      <PageContent alignItems="center">
        <VStack gap={16} maxWidth={480} fullWidth>
          <VStack gap={8}>
            <Text centerHorizontally size={14}>
              <Trans
                i18nKey="save_swap_fees_with_referral"
                components={{
                  blue: <Text as="span" color="primaryAlt" size={14} />,
                }}
              />
            </Text>
            <VStack gap={2}>
              <ActionInsideInteractiveElement
                render={() => (
                  <TextInput
                    disabled={Boolean(friendReferral)}
                    onValueChange={val => setValue(val)}
                    placeholder={t('enter_referral_code_placeholder')}
                    value={value}
                  />
                )}
                action={
                  <UnstyledButton onClick={handlePaste}>
                    <IconWrapper
                      style={{
                        fontSize: 20,
                      }}
                    >
                      <ClipboardCopyIcon />
                    </IconWrapper>
                  </UnstyledButton>
                }
                actionPlacerStyles={{
                  bottom: (textInputHeight - 28) / 2,
                  right: textInputHorizontalPadding,
                }}
              />
              {!friendReferral && error && (
                <FormFieldErrorText>{error}</FormFieldErrorText>
              )}
            </VStack>
          </VStack>
          <SaveReferralButton
            disabled={disabled}
            onClick={() => (friendReferral ? onFinish() : handleSave())}
          >
            <Text as="span" color="contrast">
              {friendReferral
                ? t('edit_friends_referral')
                : t('add_referral_code')}
            </Text>
          </SaveReferralButton>
        </VStack>
      </PageContent>
    </>
  )
}

const SaveReferralButton = styled(Button)`
  background-color: rgba(17, 40, 74, 1);
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: ${getColor('buttonHover')};
  }
`
