import { fromBinary, JsonObject } from '@bufbuild/protobuf'
import { base64Decode } from '@bufbuild/protobuf/wire'
import { Animation } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Animation'
import { Collapse } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Collapse'
import { Request } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Request'
import { Sender } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Sender'
import { SignMessageOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import {
  Description,
  Divider,
} from '@core/inpage-provider/popup/view/resolvers/signMessage/styles'
import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { PolicySchema } from '@core/mpc/types/plugin/policy_pb'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { HStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { isHexString } from 'ethers'
import { FC, Fragment, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { parseConfiguration } from '../utils'

export const PolicyOverview: FC<SignMessageOverview> = ({
  address,
  keysignPayload,
  message,
  method,
  signature,
}) => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const { requestFavicon, requestOrigin } = usePopupContext<'signMessage'>()
  const navigate = useCoreNavigate()
  const isFinished = Boolean(signature)

  const snakeCaseToTitle = (input: string) => {
    if (!input) return input

    return input
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const policy = useMemo(() => {
    const [recipe] = message.split('*#*')
    const decoded = fromBinary(PolicySchema, base64Decode(recipe))
    const parsedConfiguration = parseConfiguration(
      decoded.configuration as JsonObject
    )

    return {
      ...decoded,
      configuration: parsedConfiguration,
    }
  }, [message])

  const executeNavigation = useCallback(() => {
    navigate({ id: 'keysign', state: { keysignPayload, securityType: 'fast' } })
  }, [keysignPayload, navigate])

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t(isFinished ? 'overview' : 'sign_message')}
        hasBorder
      />
      <PageContent gap={16} scrollable>
        {isFinished && <Animation />}
        <Sender favicon={requestFavicon} origin={requestOrigin} isValidated />
        <Request
          address={address}
          message={t('verify_identity_sign')}
          method={method}
        />

        <Collapse title={t('plugin_info')} collapsed>
          <HStack
            alignItems="center"
            gap={8}
            justifyContent="space-between"
            wrap="nowrap"
          >
            <Text as="span" color="shy" size={14} weight={500} nowrap>
              {t('name')}
            </Text>
            <Text as="span" size={14} weight={500}>
              {policy.name}
            </Text>
          </HStack>
          {policy.description && (
            <>
              <Divider />
              <HStack
                alignItems="center"
                gap={8}
                justifyContent="space-between"
                wrap="nowrap"
              >
                <Text as="span" color="shy" size={14} weight={500} nowrap>
                  {t('description')}
                </Text>
                <Text as="span" size={13} weight={500}>
                  {policy.description}
                </Text>
              </HStack>
            </>
          )}
          <Divider />
          <HStack
            alignItems="center"
            gap={8}
            justifyContent="space-between"
            wrap="nowrap"
          >
            <Text as="span" color="shy" size={14} weight={500} nowrap>
              ID
            </Text>
            <Text as="span" size={14} weight={500}>
              {policy.id}
            </Text>
          </HStack>
          <Divider />
          <HStack
            alignItems="center"
            gap={8}
            justifyContent="space-between"
            wrap="nowrap"
          >
            <Text as="span" color="shy" size={14} weight={500} nowrap>
              {t('version')}
            </Text>
            <Text as="span" size={14} weight={500}>
              {policy.version}
            </Text>
          </HStack>
        </Collapse>
        {isFinished ? (
          <Collapse title={t('signed_signature')}>
            <Text as="span" color="info" size={14} weight={500}>
              {signature}
            </Text>
          </Collapse>
        ) : (
          <>
            {policy.rules?.length > 0 && (
              <Collapse title={t('plugin_rules')}>
                {policy.rules.map(({ resource, target }, index) => {
                  const number = `${index < 9 ? '0' : ''}${index + 1}`

                  return (
                    <Description key={number}>
                      <HStack
                        alignItems="center"
                        gap={8}
                        justifyContent="space-between"
                        wrap="nowrap"
                      >
                        <Text
                          as="span"
                          color="shy"
                          size={12}
                          weight={500}
                          nowrap
                        >
                          {t('resource')}
                        </Text>
                        <Text as="span" size={12} weight={500}>
                          {resource}
                        </Text>
                      </HStack>
                      {policy.configuration.map(({ key, value }) => {
                        return (
                          <Fragment key={key}>
                            <Divider />
                            <HStack
                              alignItems="center"
                              gap={8}
                              justifyContent="space-between"
                              wrap="nowrap"
                            >
                              <HStack alignItems="center" gap={4} wrap="nowrap">
                                <Text
                                  as="span"
                                  color="shy"
                                  size={12}
                                  weight={500}
                                  nowrap
                                >
                                  {snakeCaseToTitle(key)}
                                </Text>
                              </HStack>
                              {isHexString(value) ? (
                                <MiddleTruncate
                                  justifyContent="end"
                                  size={12}
                                  text={value}
                                  weight={500}
                                  flexGrow
                                />
                              ) : (
                                <Text
                                  as="span"
                                  size={12}
                                  weight={500}
                                  cropped
                                  nowrap
                                >
                                  {value}
                                </Text>
                              )}
                            </HStack>
                          </Fragment>
                        )
                      })}
                      {target ? (
                        <>
                          <Divider />
                          <HStack
                            alignItems="center"
                            gap={8}
                            justifyContent="space-between"
                            wrap="nowrap"
                          >
                            {target.target.case ? (
                              <HStack alignItems="center" gap={4} wrap="nowrap">
                                <Text
                                  as="span"
                                  color="shy"
                                  size={12}
                                  weight={500}
                                  nowrap
                                >
                                  {t('target')}
                                </Text>
                                <Text
                                  as="span"
                                  color="shy"
                                  size={10}
                                  weight={500}
                                  nowrap
                                >
                                  {`(${snakeCaseToTitle(target.target.case)})`}
                                </Text>
                              </HStack>
                            ) : (
                              <Text
                                as="span"
                                color="shy"
                                size={12}
                                weight={500}
                                nowrap
                              >
                                {t('target')}
                              </Text>
                            )}
                            {isHexString(target.target.value) ? (
                              <MiddleTruncate
                                justifyContent="end"
                                size={12}
                                text={target.target.value}
                                weight={500}
                                flexGrow
                              />
                            ) : (
                              <Text
                                as="span"
                                size={12}
                                weight={500}
                                cropped
                                nowrap
                              >
                                {target.target.value || '-'}
                              </Text>
                            )}
                          </HStack>
                        </>
                      ) : (
                        <></>
                      )}
                    </Description>
                  )
                })}
              </Collapse>
            )}
            <Collapse title={t(`message`)}>
              <Text as="span" color="info" size={14} weight={500}>
                {message}
              </Text>
            </Collapse>
          </>
        )}
      </PageContent>
      <PageFooter>
        {isFinished ? (
          <Button onClick={goHome}>{t('complete')}</Button>
        ) : (
          <Button onClick={executeNavigation}>{t('continue')}</Button>
        )}
      </PageFooter>
    </>
  )
}
