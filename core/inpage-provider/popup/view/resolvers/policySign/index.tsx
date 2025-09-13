import { fromBinary } from '@bufbuild/protobuf'
import { base64Decode } from '@bufbuild/protobuf/wire'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { Policy, PolicySchema } from '@core/mpc/types/plugin/policy_pb'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { BadgeCheckIcon } from '@lib/ui/icons/BadgeCheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type InitialState = {
  pluginVersion?: string
  policy?: Policy
  policyVersion?: string
  publicKey?: string
}

export const PolicySign: PopupResolver<'policySign'> = ({ input }) => {
  const { t } = useTranslation()
  const initialState: InitialState = {}
  const [state, setState] = useState<InitialState>(initialState)
  const { policy } = state

  useEffect(() => {
    const [recipe] = input.message.split('*#*')

    const decoded = base64Decode(recipe)
    const policy = fromBinary(PolicySchema, decoded)

    setState(prevState => ({ ...prevState, policy }))
  }, [input])

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
                src="core/images/plugin-information.png"
                render={props => <StyledImage alt="" {...props} />}
              />
              <Text as="span" size={14} weight={500}>
                app.thorswap.com
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
            <Text as="span" size={14} weight={500}>
              0xD0656...CD4C7
            </Text>
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
        <StyledSection>
          <Text as="span" size={14} weight={500}>
            {t(`signed_signature`)}
          </Text>
          <Text as="span" color="info" size={13} weight={500}>
            d355f69ed43cb2200ad08b765d1c0a8b6e88c1abf0bc797c5a9e60364ecc47fd67287f6f493b969583fd7a6b7839b4ed8ef23cf99b13ac062b2886095ab2e0970
          </Text>
        </StyledSection>
      </PageContent>
      <PageFooter>
        <Button>{t('sign_transaction')}</Button>
      </PageFooter>
    </>
  )
}

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

const StyledDescription = styled(VStack)`
  background-color: ${getColor('foregroundExtra')};
  border: 1px dashed ${getColor('foregroundSuper')};
  border-radius: 16px;
  gap: 12px;
  padding: 12px;
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
