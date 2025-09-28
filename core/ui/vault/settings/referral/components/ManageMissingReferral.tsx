import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Image } from '@lib/ui/image/Image'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@lib/utils/attempt'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useCore } from '../../../../state/core'
import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../../storage/referrals'
import { useCurrentVault } from '../../../state/currentVault'
import { useFriendReferralValidation } from './EditFriendReferralForm/hooks/useFriendReferralValidation'
import { ReferralPageWrapper } from './Referrals.styled'

type Props = {
  onCreateReferral: () => void
}

const copyButtonSize = 27

export const ManageMissingReferral = ({ onCreateReferral }: Props) => {
  const [value, setValue] = useState('')

  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vaultId = useAssertCurrentVaultId()
  const { data: friendReferral } = useFriendReferralQuery(vaultId)
  const { getClipboardText } = useCore()
  const { name: vaultName } = useCurrentVault()

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
              <Text size={14}>{t('vault_selected')}</Text>
              <VaultFieldWrapper onClick={() => {}}>
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
            </Wrapper>
          </ReferralPageWrapper>
        </AnimatedVisibility>
      </ReferralPageWrapper>
    </>
  )
}

const Wrapper = styled(VStack)`
  position: relative;

  border: 1px solid ${getColor('foregroundExtra')};
  padding: 14px;
  border-radius: 12px;
  background: rgba(2, 18, 43, 0.5);
`

const fieldWrapperStyles = css`
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 14px;
`

const HorizontalFieldWrapper = styled(HStack)`
  ${fieldWrapperStyles};
  justify-content: space-between;
  align-items: center;
`

const VaultFieldWrapper = styled(HorizontalFieldWrapper)`
  border-radius: 99px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
