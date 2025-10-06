import { fromBinary } from '@bufbuild/protobuf'
import { base64Decode } from '@bufbuild/protobuf/wire'
import { SignMessageOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import {
  StyledDescription,
  StyledDivider,
  StyledImage,
  StyledSection,
  StyledVerify,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/styles'
import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { PolicySchema } from '@core/mpc/types/plugin/policy_pb'
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

export const PolicyOverview: FC<SignMessageOverview> = ({
  chain,
  message,
  method,
  signature,
}) => {
  const { t } = useTranslation()
  const { requestFavicon, requestOrigin } = usePopupContext<'signMessage'>()
  const address = useCurrentVaultAddress(chain)
  const isFinished = useMemo(() => !!signature, [signature])

  const camelCaseToTitle = (input: string) => {
    return input
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  const policy = useMemo(() => {
    const [recipe] = message.split('*#*')

    return fromBinary(PolicySchema, base64Decode(recipe))
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
        <HStack alignItems="center" gap={8} justifyContent="space-between">
          <Text as="span" color="shy" size={14} weight={500}>
            {t('dapp_name')}
          </Text>
          <Text as="span" size={14} weight={500}>
            {policy.name}
          </Text>
        </HStack>
        <StyledDivider />
        {!!policy.description && (
          <>
            <VStack gap={4}>
              <Text as="span" color="shy" size={14} weight={500}>
                {t('description')}
              </Text>
              <Text as="span" size={13} weight={500}>
                {policy.description}
              </Text>
            </VStack>
            <StyledDivider />
          </>
        )}
        <HStack alignItems="center" gap={8} justifyContent="space-between">
          <Text as="span" color="shy" size={14} weight={500}>
            ID
          </Text>
          <Text as="span" size={14} weight={500}>
            {policy.id}
          </Text>
        </HStack>
        <StyledDivider />
        <HStack alignItems="center" gap={8} justifyContent="space-between">
          <Text as="span" color="shy" size={14} weight={500}>
            {t('version')}
          </Text>
          <Text as="span" size={14} weight={500}>
            {policy.version}
          </Text>
        </HStack>
      </StyledSection>
      {isFinished ? (
        <StyledSection>
          <Text as="span" size={14} weight={500}>
            {t(`signed_signature`)}
          </Text>
          <Text as="span" color="info" size={14} weight={500}>
            {signature}
          </Text>
        </StyledSection>
      ) : (
        <>
          {policy.rules?.length > 0 && (
            <StyledSection>
              <Text as="span" size={14} weight={500}>
                {t('rules')}
              </Text>
              {policy.rules.map(({ parameterConstraints, resource }, index) => {
                const number = `${index < 9 ? '0' : ''}${index + 1}`

                return (
                  <StyledDescription key={number}>
                    <VStack gap={4}>
                      <Text as="span" color="shy" size={12} weight={500}>
                        {t('rule_item', { number })}
                      </Text>
                      <Text as="span" size={12} weight={500}>
                        {resource}
                      </Text>
                    </VStack>
                    {parameterConstraints.map(
                      ({ constraint, parameterName }) => {
                        const value = String(constraint?.value.value || '')

                        return (
                          <VStack gap={4} key={parameterName}>
                            {constraint?.value.case ? (
                              <HStack alignItems="center" gap={4}>
                                <Text
                                  as="span"
                                  color="shy"
                                  size={12}
                                  weight={500}
                                >
                                  {camelCaseToTitle(parameterName)}
                                </Text>
                                <Text
                                  as="span"
                                  color="shy"
                                  size={12}
                                  weight={500}
                                >
                                  {`(${camelCaseToTitle(constraint.value.case)})`}
                                </Text>
                              </HStack>
                            ) : (
                              <Text
                                as="span"
                                color="shy"
                                size={12}
                                weight={500}
                              >
                                {camelCaseToTitle(parameterName)}
                              </Text>
                            )}
                            {value.startsWith('0x') ? (
                              <Text
                                as={MiddleTruncate}
                                size={12}
                                text={value}
                                weight={500}
                              />
                            ) : (
                              <Text as="span" size={12} weight={500}>
                                {value}
                              </Text>
                            )}
                          </VStack>
                        )
                      }
                    )}
                  </StyledDescription>
                )
              })}
            </StyledSection>
          )}
        </>
      )}
      <StyledSection>
        <Text as="span" size={14} weight={500}>
          {t(`message`)}
        </Text>
        <Text as="span" color="info" size={14} weight={500}>
          {message}
        </Text>
      </StyledSection>
    </>
  )
}
