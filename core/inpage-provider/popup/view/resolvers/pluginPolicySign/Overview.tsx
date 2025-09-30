import { create, fromBinary } from '@bufbuild/protobuf'
import { base64Decode } from '@bufbuild/protobuf/wire'
import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { usePopupInput } from '@core/inpage-provider/popup/view/state/input'
import { PolicySchema } from '@core/mpc/types/plugin/policy_pb'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { BadgeCheckIcon } from '@lib/ui/icons/BadgeCheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const Overview = () => {
  const { t } = useTranslation()
  const { bytesCount, chain, message } = usePopupInput<'pluginPolicySign'>()
  const { requestFavicon, requestOrigin } =
    usePopupContext<'pluginPolicySign'>()
  const address = useCurrentVaultAddress(chain)

  const policy = useMemo(() => {
    const [recipe] = message.split('*#*')

    return fromBinary(PolicySchema, base64Decode(recipe))
  }, [message])

  const keysignMessagePayload = useMemo(
    () => ({
      custom: create(CustomMessagePayloadSchema, {
        chain,
        message: `\x19Ethereum Signed Message:\n${bytesCount}${message}`,
        method: 'personal_sign',
      }),
    }),
    [bytesCount, chain, message]
  )

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('sign_request')}
        hasBorder
      />
      <PageContent gap={16} scrollable>
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
                By Vultisig
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
            {t(`app_permissions`)}
          </Text>
          {policy ? (
            <VStack gap={16}>
              <HStack
                alignItems="center"
                gap={8}
                justifyContent="space-between"
              >
                <Text as="span" color="shy" size={14} weight={500}>
                  ID
                </Text>
                <Text as="span" size={14} weight={500}>
                  {policy.id}
                </Text>
              </HStack>
              <StyledDivider />
              <HStack
                alignItems="center"
                gap={8}
                justifyContent="space-between"
              >
                <Text as="span" color="shy" size={14} weight={500}>
                  {t('dapp_name')}
                </Text>
                <Text as="span" size={14} weight={500}>
                  {policy.name}
                </Text>
              </HStack>
              <StyledDivider />
              {policy.description ? (
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
              ) : (
                <></>
              )}
              <HStack
                alignItems="center"
                gap={8}
                justifyContent="space-between"
              >
                <Text as="span" color="shy" size={14} weight={500}>
                  {t('version')}
                </Text>
                <Text as="span" size={14} weight={500}>
                  {policy.version}
                </Text>
              </HStack>
              {policy.rules?.length ? (
                <StyledDescription>
                  <Text as="span" size={14} weight={500}>
                    {t('rules')}
                  </Text>
                  {policy.rules.map((rule, index) => {
                    const number = `${index < 9 ? '0' : ''}${index + 1}`

                    return (
                      <VStack gap={4} key={number}>
                        <Text as="span" color="shy" size={14} weight={500}>
                          {t('rule_item', { number })}
                        </Text>
                        <Text as="span" size={13} weight={500}>
                          {rule.resource}
                        </Text>
                      </VStack>
                    )
                  })}
                </StyledDescription>
              ) : (
                <></>
              )}
            </VStack>
          ) : (
            <></>
          )}
        </StyledSection>
      </PageContent>
      <PageFooter>
        <StartKeysignPrompt keysignPayload={keysignMessagePayload} />
      </PageFooter>
    </>
  )
}

const StyledDescription = styled(VStack)`
  background-color: ${getColor('foregroundExtra')};
  border: 1px dashed ${getColor('foregroundSuper')};
  border-radius: 16px;
  gap: 12px;
  padding: 12px;
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

const StyledImage = styled.img`
  height: 36px;
  width: 36px;
`

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
