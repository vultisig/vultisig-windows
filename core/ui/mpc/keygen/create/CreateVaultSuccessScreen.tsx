import { Animation } from '@lib/ui/animations/Animation'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import {
  mediaQuery,
  useIsTabletDeviceAndUp,
} from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const SETUP_VAULT_SUCCESS_SCREEN_TIME_IN_MS = 2500

export const CreateVaultSuccessScreen = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const isTabletDeviceAndUp = useIsTabletDeviceAndUp()

  useEffect(() => {
    const timeoutId = setTimeout(
      onFinish,
      SETUP_VAULT_SUCCESS_SCREEN_TIME_IN_MS
    )

    return () => clearTimeout(timeoutId)
  }, [onFinish])

  return (
    <Wrapper justifyContent="center" alignItems="center">
      <VStack flexGrow justifyContent="center" alignItems="center">
        <RiveWrapper>
          <Animation src="/core/animations/vault-created.riv" />
        </RiveWrapper>
        <VStack alignItems="center" gap={16}>
          <Text centerHorizontally size={isTabletDeviceAndUp ? 40 : 24}>
            {t('vaultCreated')}{' '}
            <GradientText as="span">{t('successfully')}</GradientText>
          </Text>
          <Spinner size="3em" />
        </VStack>
      </VStack>
    </Wrapper>
  )
}

const Wrapper = styled(PageContent)`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
`

const RiveWrapper = styled.div`
  width: 100%;
  flex: 1;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    width: 600px;
  }
`
