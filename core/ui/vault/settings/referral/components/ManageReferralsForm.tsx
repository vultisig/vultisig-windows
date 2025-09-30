import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
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
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@lib/utils/attempt'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useCore } from '../../../../state/core'
import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../../storage/referrals'
import { useFriendReferralValidation } from './EditFriendReferralForm/hooks/useFriendReferralValidation'
import { FormFieldErrorText, ReferralPageWrapper } from './Referrals.styled'

type Props = {
  onSaveReferral: (friendReferral: string) => void
  onCreateReferral: () => void
  onEditFriendReferral: () => void
}

const copyButtonSize = 27

export const ManageReferralsForm = ({
  onSaveReferral,
  onCreateReferral,
  onEditFriendReferral,
}: Props) => {
  const [value, setValue] = useState('')

  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaultId = useAssertCurrentVaultId()
  const { data: friendReferral } = useFriendReferralQuery(vaultId)
  const { getClipboardText } = useCore()
  const {
    colors: { primaryAlt },
  } = useTheme()

  const handlePaste = async () => {
    const { data } = await attempt(getClipboardText)
    if (data) {
      setValue(data)
    }
  }

  const error = useFriendReferralValidation(value)
  const disabled = friendReferral
    ? false
    : Boolean(error) || value.trim().length === 0

  useEffect(() => {
    if (friendReferral) {
      setValue(friendReferral)
    }
  }, [friendReferral])

  return (
    <>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() =>
              navigate({
                id: 'vault',
              })
            }
          />
        }
        title={t('referrals_create_page_title')}
      />
      <ReferralPageWrapper>
        <AnimatedVisibility
          animationConfig="bottomToTop"
          config={{ duration: 1000 }}
          delay={300}
          overlayStyles={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <VStack justifyContent="center" fullWidth flexGrow gap={20}>
            <DecorationImage src="/core/images/crypto-natives.png" alt="" />
            <VStack gap={16}>
              <VStack gap={8}>
                <Text centerHorizontally size={14}>
                  <Trans
                    i18nKey="save_swap_fees_with_referral"
                    components={{
                      blue: <span style={{ color: primaryAlt.toCssValue() }} />,
                    }}
                  />
                </Text>
                <VStack gap={2}>
                  <ActionInsideInteractiveElement
                    render={() => (
                      <TextInput
                        value={value}
                        disabled={Boolean(friendReferral)}
                        onValueChange={val => setValue(val)}
                        placeholder={t('enter_referral_code_placeholder')}
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
                      bottom: (textInputHeight - copyButtonSize) / 2,
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
                onClick={() =>
                  friendReferral
                    ? onEditFriendReferral()
                    : onSaveReferral(value)
                }
              >
                <Text as="span" color="contrast">
                  {friendReferral
                    ? t('edit_friends_referral')
                    : t('add_referral_code')}
                </Text>
              </SaveReferralButton>
              <HStack gap={16} alignItems="center">
                <DecorationLine />
                <Text size={12}>{t('or').toUpperCase()}</Text>
                <DecorationLine />
              </HStack>
              <Text centerHorizontally size={14}>
                <Trans
                  i18nKey="create_own_referral"
                  components={{
                    blue: <span style={{ color: primaryAlt.toCssValue() }} />,
                  }}
                />
              </Text>
              <Button onClick={onCreateReferral}>{t('create_referral')}</Button>
            </VStack>
          </VStack>
        </AnimatedVisibility>
      </ReferralPageWrapper>
    </>
  )
}

const DecorationImage = styled.img`
  width: 365px;
  height: 365px;
  object-fit: cover;
  align-self: center;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    width: 500px;
    height: 500px;
  }
`

const SaveReferralButton = styled(Button)`
  background-color: rgba(17, 40, 74, 1);
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: ${getColor('buttonHover')};
  }
`

const DecorationLine = styled.div`
  height: 1px;
  flex: 1;
  background-color: ${getColor('foregroundExtra')};
`
