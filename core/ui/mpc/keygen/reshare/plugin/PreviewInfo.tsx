import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { CircleArrowDownIcon } from '@lib/ui/icons/CircleArrowDownIcon'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { LogoBoxIcon } from '@lib/ui/icons/LogoBoxIcon'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { StarIcon } from '@lib/ui/icons/StarIcon'
import { VultisigLogoIcon } from '@lib/ui/icons/VultisigLogoIcon'
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
      <PageHeader
        title={
          <HStack gap={10} alignItems="center" position="relative">
            <LogoBox />
            <LogoIcon />
            <Text as="span" size={22} weight={500}>
              {t('app_store')}
            </Text>
          </HStack>
        }
      />
      <PageContent alignItems="center" justifyContent="center" scrollable>
        <VStack gap={24} maxWidth={576} fullWidth>
          <Text as="span" size={22} weight={500} centerHorizontally>
            {t('install_app')}
          </Text>
          <AppInfo>
            <HStack alignItems="center" gap={12}>
              <Text as={LogoBoxIcon} color="contrast" size={56} />
              <VStack gap={8} justifyContent="center">
                <Text as="span" size={17} weight={500}>
                  {name}
                </Text>
                <HStack alignItems="center" gap={8}>
                  <HStack alignItems="center" gap={2}>
                    <Text as={CircleArrowDownIcon} color="shy" size={16} />
                    <Text as="span" color="shy" size={16} weight={500}>
                      {1258}
                    </Text>
                  </HStack>
                  <Divider />
                  <HStack alignItems="center" gap={2}>
                    <Text as={StarIcon} color="warning" size={16} />
                    <Text as="span" color="shy" size={16} weight={500}>
                      {`${4}/5 (${10})`}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
            <Text as="span" size={14} weight={500}>
              Automate your salaries. Set and forget payroll for your team. It
              was never this easy.
            </Text>
          </AppInfo>
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

const AppInfo = styled.div`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 16px 24px;
`

const Divider = styled.div`
  background-color: ${getColor('foregroundExtra')};
  height: 3px;
  width: 3px;
`

const Layout = styled(VStack)`
  background-image: url('assets/plugin_flow_bg.jpg');
  background-position: top center;
  background-repeat: repeat-x;
`

const LogoIcon = styled(VultisigLogoIcon)`
  font-size: 24px;
  left: 8px;
  position: absolute;
  top: 8px;

  path {
    fill: ${getColor('white')};
  }
`

const LogoBox = styled(LogoBoxIcon)`
  color: ${getColor('buttonPrimary')};
  height: 40px;
  width: 40px;
`
