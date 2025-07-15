import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { ReferralPageWrapper } from './Referrals.styled'

type Props = {
  onSaveReferral: () => void
  onCreateReferral: () => void
}

export const ManageReferralsForm = ({
  onSaveReferral,
  onCreateReferral,
}: Props) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

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
        title={t('title_1')}
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
          <VStack fullWidth flexGrow gap={20}>
            <DecorationImage src="/core/images/crypto-natives.png" alt="" />
            <VStack gap={16}>
              <VStack gap={8}>
                <Text size={14}>{t('use_referral_code')}</Text>
                <TextInput placeholder={t('enter_referral_code_placeholder')} />
              </VStack>
              <SaveReferralButton onClick={onSaveReferral}>
                {t('save')}
              </SaveReferralButton>
              <HStack gap={16} alignItems="center">
                <DecorationLine />
                <Text size={12}>{t('or').toUpperCase()}</Text>
                <DecorationLine />
              </HStack>
              <Button onClick={onCreateReferral}>{t('create_referral')}</Button>
            </VStack>
          </VStack>
        </AnimatedVisibility>
      </ReferralPageWrapper>
    </>
  )
}

const DecorationImage = styled.img`
  flex: 1;
  width: 365px;
  height: 365px;
  object-fit: cover;
  align-self: center;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    width: 450px;
    height: 450px;
  }
`

const SaveReferralButton = styled(Button)`
  border: 1px solid ${getColor('buttonPrimary')};
  background-color: transparent;
  font-weight: 600;

  &:hover {
    border: 1px solid ${getColor('buttonHover')};
  }
`

const DecorationLine = styled.div`
  height: 1px;
  flex: 1;
  background-color: ${getColor('foregroundExtra')};
`
