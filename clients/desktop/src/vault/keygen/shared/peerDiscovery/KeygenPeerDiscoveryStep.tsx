import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { recommendedPeers, requiredPeers } from '@core/mpc/peers/config'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { Match } from '@lib/ui/base/Match'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { range } from '@lib/utils/array/range'
import { without } from '@lib/utils/array/without'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { BrowserOpenURL } from '@wailsapp/runtime'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps'
import { QueryBasedQrCode } from '../../../../lib/ui/qr/QueryBasedQrCode'
import { useMpcLocalPartyId } from '../../../../mpc/localPartyId/state/mpcLocalPartyId'
import { InitiatingDevice } from '../../../../mpc/peers/InitiatingDevice'
import { PeerOption } from '../../../../mpc/peers/option/PeerOption'
import { PeerDiscoveryFormFooter } from '../../../../mpc/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '../../../../mpc/peers/PeerPlaceholder'
import { PeerRequirementsInfo } from '../../../../mpc/peers/PeerRequirementsInfo'
import { PeersContainer } from '../../../../mpc/peers/PeersContainer'
import { PeersManagerFrame } from '../../../../mpc/peers/PeersManagerFrame'
import { PeersManagerTitle } from '../../../../mpc/peers/PeersManagerTitle'
import { PeersPageContentFrame } from '../../../../mpc/peers/PeersPageContentFrame'
import { useMpcPeers } from '../../../../mpc/peers/state/mpcPeers'
import { MpcLocalServerIndicator } from '../../../../mpc/serverType/MpcLocalServerIndicator'
import { useMpcServerType } from '../../../../mpc/serverType/state/mpcServerType'
import { FitPageContent } from '../../../../ui/page/PageContent'
import { PageFormFrame } from '../../../../ui/page/PageFormFrame'
import { PageHeader } from '../../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle'
import { useJoinKeygenUrlQuery } from '../../../setup/peers/queries/useJoinKeygenUrlQuery'
import { useCurrentKeygenType } from '../../state/currentKeygenType'
import { CurrentPeersCorrector } from './CurrentPeersCorrector'
import { DownloadKeygenQrCode } from './DownloadKeygenQrCode'
import { KeygenPeerDiscoveryEducation } from './KeygenPeerDiscoveryEducation'
import { usePeerOptionsQuery } from './queries/usePeerOptionsQuery'

type KeygenPeerDiscoveryStepProps = OnForwardProp & Partial<OnBackProp>

const educationUrl: Record<KeygenType, string> = {
  [KeygenType.Keygen]:
    'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
  [KeygenType.Migrate]:
    'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
  [KeygenType.Reshare]:
    'https://docs.vultisig.com/vultisig-vault-user-actions/managing-your-vault/vault-reshare',
}

const recommendedDevicesTarget = recommendedPeers + 1

export const KeygenPeerDiscoveryStep = ({
  onForward,
  onBack,
}: KeygenPeerDiscoveryStepProps) => {
  const [serverType] = useMpcServerType()
  const { t } = useTranslation()
  const selectedPeers = useMpcPeers()
  const peerOptionsQuery = usePeerOptionsQuery()

  const joinUrlQuery = useJoinKeygenUrlQuery()

  const localPartyId = useMpcLocalPartyId()

  const keygenType = useCurrentKeygenType()

  const keygenVault = useKeygenVault()

  const missingPeers = useMemo(() => {
    if (keygenType === KeygenType.Migrate) {
      const { signers } = getRecordUnionValue(keygenVault, 'existingVault')
      const requiredPeers = without(signers, localPartyId)
      return without(requiredPeers, ...selectedPeers)
    }

    return []
  }, [keygenType, keygenVault, localPartyId, selectedPeers])

  const devicesTarget = useMemo(() => {
    if (keygenType === KeygenType.Migrate) {
      const { signers } = getRecordUnionValue(keygenVault, 'existingVault')

      return Math.max(signers.length, recommendedDevicesTarget)
    }

    return recommendedDevicesTarget
  }, [keygenType, keygenVault])

  const isDisabled = useMemo(() => {
    if (selectedPeers.length < requiredPeers) {
      return t('select_n_devices', { count: requiredPeers })
    }

    if (keygenType === KeygenType.Migrate && missingPeers.length > 0) {
      return `${t('missing_devices_for_migration')}: ${missingPeers.join(', ')}`
    }
  }, [keygenType, missingPeers, selectedPeers.length, t])

  return (
    <>
      <CurrentPeersCorrector />
      <PageHeader
        title={<PageHeaderTitle>{t('scan_qr')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={
          <MatchQuery
            value={joinUrlQuery}
            success={value => (
              <>
                <PageHeaderIconButton
                  onClick={() => {
                    BrowserOpenURL(educationUrl[keygenType])
                  }}
                  icon={<InfoIcon />}
                />
                <DownloadKeygenQrCode value={value} />
              </>
            )}
          />
        }
      />
      <FitPageContent
        as="form"
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <PageFormFrame>
          <PeersPageContentFrame>
            <QueryBasedQrCode value={joinUrlQuery} />
            <PeersManagerFrame>
              <Match
                value={serverType}
                local={() => <MpcLocalServerIndicator />}
                relay={() => <PeerRequirementsInfo />}
              />
              <PeersManagerTitle target={devicesTarget} />
              <PeersContainer>
                <InitiatingDevice />
                <MatchQuery
                  value={peerOptionsQuery}
                  success={peerOptions => {
                    const missingRecommendedPeers =
                      recommendedPeers - peerOptions.length

                    const placeholderCount =
                      keygenType === KeygenType.Migrate
                        ? Math.max(missingPeers.length, missingRecommendedPeers)
                        : missingRecommendedPeers

                    return (
                      <>
                        {peerOptions.map(value => (
                          <PeerOption key={value} value={value} />
                        ))}
                        {range(placeholderCount).map(index => (
                          <PeerPlaceholder key={index}>
                            {t('scanWithDevice', {
                              deviceNumber: index + peerOptions.length + 1,
                            })}
                          </PeerPlaceholder>
                        ))}
                        {keygenType !== KeygenType.Migrate && (
                          <>
                            {peerOptions.length >= recommendedPeers && (
                              <PeerPlaceholder>
                                {t('optionalDevice')}
                              </PeerPlaceholder>
                            )}
                          </>
                        )}
                      </>
                    )
                  }}
                />
              </PeersContainer>
            </PeersManagerFrame>
          </PeersPageContentFrame>
          <PeerDiscoveryFormFooter isDisabled={isDisabled} />
        </PageFormFrame>
      </FitPageContent>
      <KeygenPeerDiscoveryEducation />
    </>
  )
}
