import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/buttons/Button'
import { BadgeCheckIcon } from '@lib/ui/icons/BadgeCheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const Result = () => {
  const { t } = useTranslation()
  const { chain } = usePopupInput<'pluginConnectSign'>()
  const { requestFavicon, requestOrigin } =
    usePopupContext<'pluginConnectSign'>()
  const address = useCurrentVaultAddress(chain)
  const [{ signature }] = useViewState<{ signature?: string }>()
  return (
    <>
      <PageContent gap={16} scrollable>
        <VStack style={{ height: 220, position: 'relative' }} fullWidth>
          <Animation src="/core/animations/vault-created.riv" />
          <AnimatedVisibility delay={300}>
            <GradientText
              as="span"
              size={24}
              style={{ bottom: 40, left: 0, position: 'absolute', right: 0 }}
              centerHorizontally
            >
              {t('signature_successful')}
            </GradientText>
          </AnimatedVisibility>
        </VStack>
        <StyledSection>
          <Text as="span" color="shy" size={14} weight={500}>
            {t(`request_from`)}
          </Text>
          <HStack gap={12} alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" gap={12}>
              <SafeImage
                src={requestFavicon}
                render={props => <StyledImage alt="" {...props} />}
              />
              <Text as="span" size={14} weight={500}>
                {getUrlBaseDomain(requestOrigin)}
              </Text>
            </HStack>
            <StyledVerify alignItems="center" gap={4}>
              <Text as={BadgeCheckIcon} color="success" size={16} />
              <Text as="span" size={12} weight={500}>
                {t('by_vultisig')}
              </Text>
            </StyledVerify>
          </HStack>
        </StyledSection>
        <StyledSection>
          <HStack alignItems="center" gap={8} justifyContent="space-between">
            <Text as="span" color="shy" size={14} weight={500}>
              {t('method')}
            </Text>
            <Text as="span" size={14} weight={500}>
              {t('personal_sign')}
            </Text>
          </HStack>
          <StyledDivider />
          <HStack alignItems="center" gap={8} justifyContent="space-between">
            <Text as="span" color="shy" size={14} weight={500}>
              {t('message')}
            </Text>
            <Text as="span" size={14} weight={500}>
              {t('verify_identity_sign')}
            </Text>
          </HStack>
          <StyledDivider />
          <HStack alignItems="center" gap={8} justifyContent="space-between">
            <Text as="span" color="shy" size={14} weight={500}>
              {t('signing_address')}
            </Text>
            <Text
              as={MiddleTruncate}
              size={14}
              text={address}
              weight={500}
              width={100}
            />
          </HStack>
        </StyledSection>
        <StyledSection>
          <Text as="span" size={14} weight={500}>
            {t(`signed_signature`)}
          </Text>
          <Text as="span" color="info" size={13} weight={500}>
            {signature}
          </Text>
        </StyledSection>
      </PageContent>
      <PageFooter alignItems="center">
        <Button onClick={() => window.close()}>{t('done')}</Button>
      </PageFooter>
    </>
  )
}

const StyledSection = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  gap: 16px;
  padding: 24px;
`

const StyledVerify = styled(HStack)`
  background-color: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  height: 28px;
  padding-left: 6px;
  padding-right: 8px;
`

const StyledImage = styled.img`
  height: 36px;
  width: 36px;
`

const StyledDivider = styled.div`
  background-image: linear-gradient(
    90deg,
    ${getColor('foreground')} 0%,
    ${getColor('foregroundExtra')} 49.5%,
    ${getColor('foreground')} 100%
  );
  height: 1px;
`
