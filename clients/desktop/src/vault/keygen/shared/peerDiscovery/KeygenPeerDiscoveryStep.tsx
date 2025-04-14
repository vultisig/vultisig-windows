import { parseLocalPartyId } from '@core/mpc/devices/localPartyId'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { recommendedPeers, requiredPeers } from '@core/mpc/peers/config'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useOpenUrl } from '@core/ui/state/openUrl'
import { Match } from '@lib/ui/base/Match'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { range } from '@lib/utils/array/range'
import { without } from '@lib/utils/array/without'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { QueryBasedQrCode } from '../../../../lib/ui/qr/QueryBasedQrCode'
import { InitiatingDevice } from '../../../../mpc/peers/InitiatingDevice'
import { PeerOption } from '../../../../mpc/peers/option/PeerOption'
import { PeerDiscoveryFormFooter } from '../../../../mpc/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '../../../../mpc/peers/PeerPlaceholder'
import { PeerRequirementsInfo } from '../../../../mpc/peers/PeerRequirementsInfo'
import { PeersContainer } from '../../../../mpc/peers/PeersContainer'
import { PeersManagerFrame } from '../../../../mpc/peers/PeersManagerFrame'
import { PeersManagerTitle } from '../../../../mpc/peers/PeersManagerTitle'
import { PeersPageContentFrame } from '../../../../mpc/peers/PeersPageContentFrame'
import { MpcLocalServerIndicator } from '../../../../mpc/serverType/MpcLocalServerIndicator'
import { PageFormFrame } from '../../../../ui/page/PageFormFrame'
import { useJoinKeygenUrlQuery } from '../../../setup/peers/queries/useJoinKeygenUrlQuery'
import { CurrentPeersCorrector } from './CurrentPeersCorrector'
import { DownloadKeygenQrCode } from './DownloadKeygenQrCode'
import { KeygenPeerDiscoveryEducation } from './KeygenPeerDiscoveryEducation'
import { usePeerOptionsQuery } from './queries/usePeerOptionsQuery'

type KeygenPeerDiscoveryStepProps = OnForwardProp & Partial<OnBackProp>

const educationUrl: Record<KeygenType, string> = {
  create: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
  migrate: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
  reshare:
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

  const openUrl = useOpenUrl()

  const joinUrlQuery = useJoinKeygenUrlQuery()

  const keygenVault = useKeygenVault()
  const localPartyId = useMpcLocalPartyId()

  const keygenType = useCurrentKeygenType()

  const missingPeers = useMemo(() => {
    if (keygenType === 'migrate') {
      const { signers } = getRecordUnionValue(keygenVault, 'existingVault')
      const requiredPeers = without(signers, localPartyId)
      return without(requiredPeers, ...selectedPeers)
    }

    return []
  }, [keygenVault, keygenType, localPartyId, selectedPeers])

  const devicesTarget = useMemo(() => {
    if (keygenType === 'migrate') {
      const { signers } = getRecordUnionValue(keygenVault, 'existingVault')

      return Math.max(signers.length, selectedPeers.length + 1)
    }

    return recommendedDevicesTarget
  }, [keygenType, keygenVault, selectedPeers.length])

  const isDisabled = useMemo(() => {
    if (selectedPeers.length < requiredPeers) {
      return t('select_n_devices', { count: requiredPeers })
    }

    if (keygenType === 'migrate' && missingPeers.length > 0) {
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
                    openUrl(educationUrl[keygenType])
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
                relay={() =>
                  keygenType === 'migrate' ? null : <PeerRequirementsInfo />
                }
              />
              <PeersManagerTitle target={devicesTarget} />
              <PeersContainer>
                <InitiatingDevice />
                <MatchQuery
                  value={peerOptionsQuery}
                  success={peerOptions => {
                    const placeholderCount =
                      keygenType === 'migrate'
                        ? missingPeers.length
                        : recommendedPeers - peerOptions.length

                    return (
                      <>
                        {peerOptions.map(value => (
                          <PeerOption key={value} value={value} />
                        ))}
                        {range(placeholderCount).map(index => {
                          return (
                            <PeerPlaceholder key={index}>
                              {keygenType === 'migrate'
                                ? t('scan_with_device_name', {
                                    name: parseLocalPartyId(missingPeers[index])
                                      .deviceName,
                                  })
                                : t('scan_with_device_index', {
                                    index: index + peerOptions.length + 1,
                                  })}
                            </PeerPlaceholder>
                          )
                        })}
                        {keygenType !== 'migrate' && (
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
