import { useTranslation } from 'react-i18next'

import { Button } from '../../../../../lib/ui/buttons/Button'
import { getFormProps } from '../../../../../lib/ui/form/utils/getFormProps'
import { VStack } from '../../../../../lib/ui/layout/Stack'
import {
  IsDisabledProp,
  OnBackProp,
  OnForwardProp,
  TitleProp,
} from '../../../../../lib/ui/props'
import { QueryBasedQrCode } from '../../../../../lib/ui/qr/QueryBasedQrCode'
import { MatchQuery } from '../../../../../lib/ui/query/components/MatchQuery'
import { Query } from '../../../../../lib/ui/query/Query'
import { PageContent } from '../../../../../ui/page/PageContent'
import { PageHeader } from '../../../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle'
import { useVaultType } from '../../../../setup/shared/state/vaultType'
import { KeygenNetworkReminder } from '../../KeygenNetworkReminder'
import { DownloadKeygenQrCode } from '../DownloadKeygenQrCode'
import { KeygenPeersManager } from '../KeygenPeersManager'
import { ManageServerType } from '../ManageServerType'
import { Content } from './KegenPeerDiscoveryStep.styled'

type KeygenPeerDiscoveryStepProps = OnForwardProp &
  Partial<OnBackProp> &
  TitleProp &
  IsDisabledProp & {
    joinUrlQuery: Query<string>
  }

export const KeygenPeerDiscoveryStep = ({
  onForward,
  onBack,
  title,
  isDisabled,
  joinUrlQuery,
}: KeygenPeerDiscoveryStepProps) => {
  const { t } = useTranslation()
  const vaultType = useVaultType()

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{title}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={
          <MatchQuery
            value={joinUrlQuery}
            success={value => <DownloadKeygenQrCode value={value} />}
            error={() => null}
            pending={() => null}
          />
        }
      />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <Content>
          <QueryBasedQrCode value={joinUrlQuery} />

          <VStack gap={40} alignItems="center">
            {vaultType === 'secure' && <ManageServerType />}
            <KeygenPeersManager />
            <KeygenNetworkReminder />
          </VStack>
        </Content>

        <Button type="submit" isDisabled={isDisabled}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  )
}
