import { parseLocalPartyId } from '@core/mpc/devices/localPartyId'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { MpcPeersCorrector } from '@core/ui/mpc/devices/MpcPeersCorrector'
import { InitiatingDevice } from '@core/ui/mpc/devices/peers/InitiatingDevice'
import { PeerOption } from '@core/ui/mpc/devices/peers/option/PeerOption'
import { PeerDiscoveryFormFooter } from '@core/ui/mpc/devices/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '@core/ui/mpc/devices/peers/PeerPlaceholder'
import { PeersContainer } from '@core/ui/mpc/devices/peers/PeersContainer'
import { PeersManagerFrame } from '@core/ui/mpc/devices/peers/PeersManagerFrame'
import { PeersManagerTitle } from '@core/ui/mpc/devices/peers/PeersManagerTitle'
import { PeersPageContentFrame } from '@core/ui/mpc/devices/peers/PeersPageContentFrame'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { KeygenPeerDiscoveryEducation } from '@core/ui/mpc/keygen/education/devices/KeygenPeerDiscoveryEducation'
import { DownloadKeygenQrCode } from '@core/ui/mpc/keygen/qr/DownloadKeygenQrCode'
import { useJoinKeygenUrlQuery } from '@core/ui/mpc/keygen/queries/useJoinKeygenUrlQuery'
import { useKeygenOperation } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { MpcLocalServerIndicator } from '@core/ui/mpc/server/MpcLocalServerIndicator'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageFormFrame } from '@lib/ui/page/PageFormFrame'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { QueryBasedQrCode } from '@lib/ui/qr/QueryBasedQrCode'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { range } from '@lib/utils/array/range'
import { without } from '@lib/utils/array/without'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { minKeygenDevices } from './config'
import { KeygenDevicesRequirementsInfo } from './KeygenDevicesRequirementsInfo'

type KeygenPeerDiscoveryStepProps = OnFinishProp & Partial<OnBackProp>

const educationUrl: Record<KeygenType, string> = {
  create: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
  reshare:
    'https://docs.vultisig.com/vultisig-vault-user-actions/managing-your-vault/vault-reshare',
}

export const KeygenPeerDiscoveryStep = ({
  onFinish,
  onBack,
}: KeygenPeerDiscoveryStepProps) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const [serverType] = useMpcServerType()
  const selectedPeers = useMpcPeers()
  const peerOptionsQuery = useMpcPeerOptionsQuery()
  const isLargeScreen = useIsTabletDeviceAndUp()
  const joinUrlQuery = useJoinKeygenUrlQuery()
  const keygenVault = useKeygenVault()
  const localPartyId = useMpcLocalPartyId()
  const opertaionType = useKeygenOperation()

  const recommendedPeers = useMemo(() => {
    return !selectedPeers.length ? 2 : selectedPeers.length + 1
  }, [selectedPeers])

  const isMigrate = useMemo(() => {
    return 'reshare' in opertaionType && opertaionType.reshare === 'migrate'
  }, [opertaionType])

  const missingPeers = useMemo(() => {
    if (isMigrate) {
      const { signers } = getRecordUnionValue(keygenVault, 'existingVault')
      const requiredPeers = without(signers, localPartyId)

      return without(requiredPeers, ...selectedPeers)
    }

    return []
  }, [keygenVault, isMigrate, localPartyId, selectedPeers])

  const devicesTarget = useMemo(() => {
    if (isMigrate) {
      const { signers } = getRecordUnionValue(keygenVault, 'existingVault')

      return Math.max(signers.length, selectedPeers.length + 1)
    }

    if (peerOptionsQuery.data === undefined) {
      return minKeygenDevices
    }

    return Math.max(peerOptionsQuery.data.length + 1, minKeygenDevices)
  }, [isMigrate, keygenVault, peerOptionsQuery.data, selectedPeers.length])

  const isDisabled = useMemo(() => {
    if (!selectedPeers.length) {
      return t('select_n_devices', { count: 1 })
    }

    if (isMigrate && missingPeers.length > 0) {
      return `${t('missing_devices_for_migration')}: ${missingPeers.join(', ')}`
    }
  }, [isMigrate, missingPeers, selectedPeers.length, t])

  return (
    <>
      <MpcPeersCorrector />
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={
          <MatchQuery
            value={joinUrlQuery}
            success={value => (
              <>
                <IconButton
                  onClick={() => {
                    openUrl(educationUrl[getRecordUnionKey(opertaionType)])
                  }}
                >
                  <InfoIcon />
                </IconButton>
                <DownloadKeygenQrCode value={value} />
              </>
            )}
          />
        }
        title={t('scan_qr')}
        hasBorder
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
                  isMigrate ? null : <KeygenDevicesRequirementsInfo />
                }
              />
              <PeersManagerTitle target={devicesTarget} />
              <PeersContainer>
                <InitiatingDevice />
                <MatchQuery
                  value={peerOptionsQuery}
                  success={peerOptions => {
                    const placeholderCount = isMigrate
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
                              {isMigrate
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
                        {!isMigrate && (
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
