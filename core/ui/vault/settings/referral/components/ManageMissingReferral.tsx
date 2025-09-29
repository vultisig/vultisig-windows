import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { FileQuestionIcon } from '@lib/ui/icons/FileQuestionIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Image } from '@lib/ui/image/Image'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { VaultsPage } from '../../../../vaultsOrganisation'
import { useCurrentVault } from '../../../state/currentVault'
import { AddFriendsReferralPrompt } from './AddFriendsReferralPrompt'
import {
  FixedWrapper,
  Overlay,
  ReferralPageWrapper,
  VaultFieldWrapper,
} from './Referrals.styled'

type Props = {
  onCreateReferral: () => void
  onEditFriendReferral: () => void
}

export const ManageMissingReferral = ({
  onCreateReferral,
  onEditFriendReferral,
}: Props) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { name: vaultName } = useCurrentVault()
  const { colors } = useTheme()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
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
            title={t('your_referrals')}
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
              <ReferralPageWrapper>
                <Wrapper gap={14}>
                  <Overlay />
                  <AddFriendsReferralPrompt
                    onUpdateFriendReferral={onEditFriendReferral}
                  />
                  <Text size={14}>{t('vault_selected')}</Text>
                  <VaultFieldWrapper onClick={onOpen}>
                    <HStack alignItems="center" gap={10}>
                      <Image
                        style={{
                          objectFit: 'contain',
                        }}
                        src="/core/images/vault-image-placeholder.png"
                        alt=""
                        width={28}
                        height={28}
                      />
                      <Text size={16}>{vaultName}</Text>
                    </HStack>
                    <IconWrapper
                      style={{
                        fontSize: 16,
                      }}
                    >
                      <ChevronRightIcon />
                    </IconWrapper>
                  </VaultFieldWrapper>
                  <NoReferralDescriptionWrapper>
                    <IconWrapper
                      style={{
                        fontSize: 24,
                        color: colors.primaryAlt.toCssValue(),
                      }}
                    >
                      <FileQuestionIcon />
                    </IconWrapper>
                    <Text centerHorizontally size={16}>
                      {t('no_referral_yet')}
                    </Text>
                    <Text centerHorizontally size={13} color="shyExtra">
                      {t('turn_your_vault_into_rewards_machine')}
                    </Text>
                    <Button onClick={onCreateReferral}>
                      {t('create_referral')}
                    </Button>
                  </NoReferralDescriptionWrapper>
                </Wrapper>
              </ReferralPageWrapper>
            </AnimatedVisibility>
          </ReferralPageWrapper>
        </>
      )}
      renderContent={({ onClose }) => (
        <FixedWrapper>
          <VaultsPage onFinish={onClose} />
        </FixedWrapper>
      )}
    />
  )
}

const Wrapper = styled(VStack)`
  position: relative;

  border: 1px solid ${getColor('foregroundExtra')};
  padding: 14px;
  border-radius: 12px;
  background: rgba(2, 18, 43, 0.5);
`

const NoReferralDescriptionWrapper = styled(VStack)`
  ${vStack({
    alignItems: 'center',
    gap: 20,
  })};

  padding: 36px 12px 24px 12px;
  gap: 20px;
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: rgba(2, 18, 43, 0.5);
`
