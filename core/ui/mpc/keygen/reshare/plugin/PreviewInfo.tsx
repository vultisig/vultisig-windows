import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Plugin } from '@core/ui/plugins/core/get'
import { Button } from '@lib/ui/buttons/Button'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { LogoBoxIcon } from '@lib/ui/icons/LogoBoxIcon'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FastVaultPasswordModal } from '../../../fast/FastVaultPasswordModal'

export const PreviewInfo: FC<
  OnFinishProp<{ password: string }> & ValueProp<Plugin>
> = ({ value: { description, logo_url, permissions, title }, onFinish }) => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      {step > 1 ? (
        <>
          <PageHeader
            primaryControls={
              <PageHeaderBackButton onClick={() => setStep(1)} />
            }
          />
          <StyledPageContent alignItems="center" gap={24} scrollable>
            <SafeImage
              src="/assets/app-permissions.png"
              render={props => (
                <VStack
                  as="img"
                  alt={title}
                  height={126}
                  width={126}
                  {...props}
                />
              )}
            />
            <VStack gap={24} maxWidth={576} fullWidth>
              <Text as="span" size={22} weight={500} centerHorizontally>
                {t('app_permissions')}
              </Text>
              <VStack gap={12}>
                <Panel>
                  <VStack gap={16}>
                    {permissions.map((item, index) => (
                      <HStack alignItems="center" gap={4} key={index}>
                        <Text
                          as={ShieldCheckIcon}
                          color="primaryAlt"
                          size={16}
                        />
                        <Text as="span" size={14}>
                          {item}
                        </Text>
                        <Text as={CircleInfoIcon} color="shy" size={16} />
                      </HStack>
                    ))}
                  </VStack>
                </Panel>
                <Text
                  as="span"
                  size={14}
                  color="shy"
                  weight={500}
                  centerHorizontally
                >
                  Vultisig Apps can never sign transactions you do not first
                  approve.
                </Text>
              </VStack>
            </VStack>
          </StyledPageContent>
          <PageFooter alignItems="center">
            <VStack maxWidth={576} fullWidth>
              <Button kind="primary" onClick={() => setShowModal(true)}>
                {t('accept_continue')}
              </Button>
            </VStack>
          </PageFooter>
        </>
      ) : (
        <>
          <PageHeader />
          <StyledPageContent
            alignItems="center"
            justifyContent="center"
            scrollable
          >
            <VStack alignItems="center" gap={48} maxWidth={576} fullWidth>
              <VStack position="relative">
                {logo_url ? (
                  <SafeImage
                    src={logo_url}
                    render={props => (
                      <VStack
                        as="img"
                        alt={title}
                        height={100}
                        width={100}
                        {...props}
                        style={{ borderRadius: 24 }}
                      />
                    )}
                  />
                ) : (
                  <Text as={LogoBoxIcon} color="contrast" size={100} />
                )}
                <Plus />
              </VStack>
              <VStack gap={16} fullWidth>
                <Text as="span" size={22} weight={500} centerHorizontally>
                  {t('install_app', { title })}
                </Text>
                {!!description && (
                  <Text
                    as="span"
                    size={12}
                    color="shy"
                    weight={500}
                    centerHorizontally
                  >
                    {description}
                  </Text>
                )}
              </VStack>
            </VStack>
          </StyledPageContent>
          <PageFooter alignItems="center">
            <VStack maxWidth={576} fullWidth>
              <Button
                kind="primary"
                onClick={() =>
                  permissions.length > 0 ? setStep(2) : setShowModal(true)
                }
              >
                {t('continue')}
              </Button>
            </VStack>
          </PageFooter>
        </>
      )}
      <FastVaultPasswordModal
        showModal={showModal}
        onBack={() => setShowModal(false)}
        onFinish={onFinish}
        description={t('to_start_plugin_installation')}
      />
    </>
  )
}

const StyledPageContent = styled(PageContent)`
  background-image: url('assets/plugin_flow_bg.png');
  background-position: center top;
  background-repeat: repeat-x;
`

const Plus = styled(PlusIcon)`
  background-color: ${getColor('success')};
  border: 6px solid ${getColor('background')};
  border-radius: 50%;
  color: ${getColor('background')};
  bottom: -12px;
  font-size: 44px;
  padding: 6px;
  position: absolute;
  right: -12px;
`
