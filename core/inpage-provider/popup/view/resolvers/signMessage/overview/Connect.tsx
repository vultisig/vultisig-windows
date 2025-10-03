import { SignMessageOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import {
  StyledDivider,
  StyledImage,
  StyledSection,
  StyledVerify,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/styles'
import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Animation } from '@lib/ui/animations/Animation'
import { BadgeCheckIcon } from '@lib/ui/icons/BadgeCheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { GradientText, Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const ConnectOverview: FC<SignMessageOverview> = ({
  chain,
  message,
  method,
  signature,
}) => {
  const { t } = useTranslation()
  const { requestFavicon, requestOrigin } = usePopupContext<'signMessage'>()
  const address = useCurrentVaultAddress(chain)
  const isFinished = useMemo(() => !!signature, [signature])

  const parsedMessage = useMemo(() => {
    const parsed = JSON.parse(message)

    return JSON.stringify(parsed, null, 2)
  }, [message])

  return (
    <>
      {isFinished && (
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
      )}
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
            {method}
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
            width={200}
          />
        </HStack>
      </StyledSection>
      <StyledSection>
        <Text as="span" size={14} weight={500}>
          {t(`message`)}
        </Text>
        <Text color="info" family="mono" size={14} weight={500}>
          <pre style={{ width: '100%' }}>
            <code
              style={{ display: 'block', overflowX: 'auto', width: '100%' }}
            >
              {parsedMessage}
            </code>
          </pre>
        </Text>
      </StyledSection>
      {isFinished && (
        <StyledSection>
          <Text as="span" size={14} weight={500}>
            {t(`signed_signature`)}
          </Text>
          <Text as="span" color="info" size={14} weight={500}>
            {signature}
          </Text>
        </StyledSection>
      )}
    </>
  )
}
