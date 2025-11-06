import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { LogoBoxIcon } from '@lib/ui/icons/LogoBoxIcon'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
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

export const PreviewInfo: FC<OnFinishProp & ValueProp<string>> = ({
  value: name,
  onFinish,
}) => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)

  return step > 1 ? (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={() => setStep(1)} />}
        title={t('permissions')}
        hasBorder
      />
      <PageContent alignItems="center" justifyContent="center" scrollable>
        <VStack gap={24} maxWidth={576} fullWidth>
          <VStack gap={12}>
            <Text as="span" size={22} weight={500} centerHorizontally>
              {t('allow_app_access')}
            </Text>
            <Text
              as="span"
              color="shy"
              size={14}
              weight={500}
              centerHorizontally
            >
              These actions are required to let the ..., they’re using the
              Vultisig SDK, which is ...
            </Text>
          </VStack>
          <Panel>
            <VStack gap={12}>
              {[
                'Access to transaction signing',
                'Fee deduction authorization',
                'Vault balance visibility',
              ].map((item, index) => (
                <HStack alignItems="center" gap={4} key={index}>
                  <Text as={ShieldCheckIcon} color="warning" size={16} />
                  <Text as="span" size={14}>
                    {item}
                  </Text>
                  <Text as={CircleInfoIcon} color="shy" size={16} />
                </HStack>
              ))}
            </VStack>
          </Panel>
        </VStack>
      </PageContent>
      <PageFooter alignItems="center">
        <VStack maxWidth={576} fullWidth>
          <Button kind="primary" onClick={onFinish}>
            {t('accept_continue')}
          </Button>
        </VStack>
      </PageFooter>
    </>
  ) : (
    <Layout fullHeight>
      <PageContent alignItems="center" justifyContent="center" scrollable>
        <VStack alignItems="center" gap={48} maxWidth={576} fullWidth>
          <VStack position="relative">
            <Text as={LogoBoxIcon} color="contrast" size={100} />
            <Plus />
          </VStack>
          <VStack gap={16} fullWidth>
            <Text as="span" size={22} weight={500} centerHorizontally>
              {t('install_app', { name })}
            </Text>
            <Text
              as="span"
              size={12}
              color="shy"
              weight={500}
              centerHorizontally
            >
              Automate your salaries. Set and forget payroll for your team. It
              was never this easy.
            </Text>
          </VStack>
        </VStack>
      </PageContent>
      <PageFooter alignItems="center">
        <VStack maxWidth={576} fullWidth>
          <Button kind="primary" onClick={() => setStep(2)}>
            {t('continue')}
          </Button>
        </VStack>
      </PageFooter>
    </Layout>
  )
}

const Layout = styled(VStack)`
  background-image: url('assets/plugin_flow_bg.png');
  background-position: 50% 30%;
  background-repeat: repeat-x;
`

const Plus = styled(PlusIcon)`
  background-color: ${getColor('success')};
  border: 6px solid ${getColor('background')};
  border-radius: 50%;
  color: ${getColor('background')};
  bottom: -6px;
  font-size: 44px;
  padding: 6px;
  position: absolute;
  right: -14px;
`
