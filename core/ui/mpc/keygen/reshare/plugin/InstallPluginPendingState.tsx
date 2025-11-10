import {
  InstallPluginStep,
  installPluginSteps,
} from '@core/ui/mpc/keygen/reshare/plugin/InstallPluginStep'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const InstallPluginPendingState: FC<
  ValueProp<InstallPluginStep | null>
> = ({ value }) => {
  const { t } = useTranslation()
  const [progress, setProgress] = useState<Record<InstallPluginStep, boolean>>({
    install: false,
    pluginServer: false,
    verifierServer: false,
  })
  const completedSteps = Object.values(progress).filter(Boolean).length
  const totalSteps = installPluginSteps.length

  useEffect(() => {
    if (value) setProgress(prev => ({ ...prev, [value]: true }))
  }, [value])

  return (
    <>
      <PageContent
        alignItems="center"
        gap={16}
        justifyContent="center"
        scrollable
      >
        <SafeImage
          src={`core/images/plugin-installing.jpg`}
          render={props => <img alt="" {...props} style={{ width: '324px' }} />}
        />
        <Text size={17} weight={500} nowrap>
          {`${t('installing_plugin')}...`}
        </Text>
        <VStack alignItems="center">
          <StatusBox gap={8} alignItems="center" wrap="nowrap">
            <Text as={CircleCheckIcon} color="success" size={24} />
            <Text
              size={13}
              weight={500}
            >{`${t('connected_with_server')}`}</Text>
            <Text
              color="shy"
              size={13}
              weight={500}
            >{`(${completedSteps}/${totalSteps})`}</Text>
          </StatusBox>
          <StatusBoxFirstShadow />
          <StatusBoxSecondShadow />
        </VStack>
        <Text color="shy" size={12} weight={500}>
          {t('server_connection_estimation')}
        </Text>
      </PageContent>
    </>
  )
}

const StatusBox = styled(HStack)`
  background-color: ${getColor('foregroundExtra')};
  border: 1px solid ${getColor('foregroundSuper')};
  box-shadow:
    0px 2px 2px 0px ${({ theme }) => theme.colors.transparent.toRgba(0.02)},
    0px 6px 6px 0px ${({ theme }) => theme.colors.transparent.toRgba(0.03)},
    0px 12px 10px 0px ${({ theme }) => theme.colors.transparent.toRgba(0.04)},
    0px 22px 18px 0px ${({ theme }) => theme.colors.transparent.toRgba(0.04)},
    0px 42px 34px 0px ${({ theme }) => theme.colors.transparent.toRgba(0.05)},
    0px 100px 80px 0px ${({ theme }) => theme.colors.transparent.toRgba(0.07)};
  border-radius: 16px;
  height: 48px;
  padding-left: 12px;
  padding-right: 20px;
  z-index: 3;
`

const StatusBoxFirstShadow = styled(StatusBox)`
  margin-top: -30px;
  opacity: 0.8;
  width: 90%;
  z-index: 2;
`

const StatusBoxSecondShadow = styled(StatusBox)`
  margin-top: -30px;
  opacity: 0.6;
  width: 80%;
  z-index: 1;
`
