import { parseLocalPartyId } from '@core/mpc/devices/localPartyId'
import { recommendedPeers, requiredPeers } from '@core/mpc/devices/peers/config'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { MpcPeersCorrector } from '@core/ui/mpc/devices/MpcPeersCorrector'
import { InitiatingDevice } from '@core/ui/mpc/devices/peers/InitiatingDevice'
import { PeerOption } from '@core/ui/mpc/devices/peers/option/PeerOption'
import { PeerDiscoveryFormFooter } from '@core/ui/mpc/devices/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '@core/ui/mpc/devices/peers/PeerPlaceholder'
import { PeerRequirementsInfo } from '@core/ui/mpc/devices/peers/PeerRequirementsInfo'
import { PeersContainer } from '@core/ui/mpc/devices/peers/PeersContainer'
import { PeersManagerFrame } from '@core/ui/mpc/devices/peers/PeersManagerFrame'
import { PeersManagerTitle } from '@core/ui/mpc/devices/peers/PeersManagerTitle'
import { PeersPageContentFrame } from '@core/ui/mpc/devices/peers/PeersPageContentFrame'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { KeygenPeerDiscoveryEducation } from '@core/ui/mpc/keygen/education/devices/KeygenPeerDiscoveryEducation'
import { DownloadKeygenQrCode } from '@core/ui/mpc/keygen/qr/DownloadKeygenQrCode'
import { useJoinKeygenUrlQuery } from '@core/ui/mpc/keygen/queries/useJoinKeygenUrlQuery'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { MpcLocalServerIndicator } from '@core/ui/mpc/server/MpcLocalServerIndicator'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageFormFrame } from '@lib/ui/page/PageFormFrame'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { QueryBasedQrCode } from '@lib/ui/qr/QueryBasedQrCode'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { range } from '@lib/utils/array/range'
import { without } from '@lib/utils/array/without'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type KeygenPeerDiscoveryStepProps = OnFinishProp & Partial<OnBackProp>

const educationUrl: Record<KeygenType, string> = {
  create: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
  migrate: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
  reshare:
    'https://docs.vultisig.com/vultisig-vault-user-actions/managing-your-vault/vault-reshare',
}

const recommendedDevicesTarget = recommendedPeers + 1

export const KeygenPeerDiscoveryStep = ({
  onFinish,
  onBack,
}: KeygenPeerDiscoveryStepProps) => {
  const [serverType] = useMpcServerType()
  const { t } = useTranslation()
  const selectedPeers = useMpcPeers()
  const peerOptionsQuery = useMpcPeerOptionsQuery()
  const isLargeScreen = useIsTabletDeviceAndUp()

  const { openUrl } = useCore()

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
      <MpcPeersCorrector />
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
          onSubmit: onFinish,
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
      {/* FIXME: only show the overlay on desktop for now. Antonio to make it responsive and add it back for Extension as well. */}
      {isLargeScreen && <KeygenPeerDiscoveryEducation />}
    </>
  )
}
