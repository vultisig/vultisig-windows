import { Animation } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Animation'
import { Collapse } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Collapse'
import { Request } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Request'
import { Sender } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Sender'
import { SignMessageOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ConnectOverview: FC<SignMessageOverview> = ({
  address,
  keysignPayload,
  message,
  signature,
}) => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const { requestFavicon, requestOrigin } = usePopupContext<'signMessage'>()
  const navigate = useCoreNavigate()

  const displayMessage = useMemo(() => {
    const { data, error } = attempt(() => JSON.parse(message))

    if (error) return ''

    return data.message as string
  }, [message])

  const executeNavigation = useCallback(() => {
    navigate({ id: 'keysign', state: { keysignPayload, securityType: 'fast' } })
  }, [keysignPayload, navigate])

  return signature ? (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('overview')}
        hasBorder
      />
      <PageContent gap={16} scrollable>
        <Animation />
        <Sender favicon={requestFavicon} origin={requestOrigin} isValidated />
        <Request address={address} message={displayMessage} />
        <Collapse title={t('signed_signature')}>
          <Text as="span" color="info" size={14} weight={500}>
            {signature}
          </Text>
        </Collapse>
      </PageContent>
      <PageFooter>
        <Button onClick={goHome}>{t('complete')}</Button>
      </PageFooter>
    </>
  ) : (
    <>
      <StyledPageContent
        alignItems="center"
        gap={16}
        justifyContent="flex-end"
        scrollable
      >
        <SafeImage
          src="/assets/install-app-logo.png"
          render={props => (
            <VStack as="img" height={60} width={60} {...props} />
          )}
        />
        <Text size={22} weight={500} centerHorizontally>
          Welcome to the Vultisig App Store
        </Text>
        <Text color="shy" size={12} weight={500} centerHorizontally>
          Sign in with your Vultisig Vault to access Apps to automate your
          digital Assets
        </Text>
      </StyledPageContent>
      <PageFooter>
        <Button onClick={executeNavigation}>{t('continue')}</Button>
      </PageFooter>
    </>
  )
}

const StyledPageContent = styled(PageContent)`
  background-image: url('assets/install-app-bg.png');
  background-position: center top;
  background-repeat: no-repeat;
  background-size: contain;
  padding-bottom: 32px;
`
