import { parseLocalPartyId } from '@core/mpc/devices/localPartyId'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { mpcServerTypes } from '@core/mpc/MpcServerType'
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
import { useTargetDeviceCount } from '@core/ui/mpc/keygen/state/targetDeviceCount'
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
import { range } from '@lib/utils/array/range'
import { without } from '@lib/utils/array/without'
import { getPairComplement } from '@lib/utils/pair/getPairComplement'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { AutoStartKeygen } from './AutoStartKeygen'
import { minKeygenDevices } from './config'
import { KeygenDevicesRequirementsInfo } from './KeygenDevicesRequirementsInfo'
import { SecureVaultPeerDiscoveryScreen } from './SecureVaultPeerDiscoveryScreen'

type KeygenPeerDiscoveryStepProps = OnFinishProp & Partial<OnBackProp>

const educationUrl: Record<KeygenType, string> = {
  create: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
  reshare:
    'https://docs.vultisig.com/vultisig-vault-user-actions/managing-your-vault/vault-reshare',
  keyimport: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault', // TODO : Update URL when key import docs are available
}

export const KeygenPeerDiscoveryStep = ({
  onFinish,
  onBack,
}: KeygenPeerDiscoveryStepProps) => {
  const { t } = useTranslation()
  const { isLocalModeAvailable, openUrl } = useCore()
  const [serverType, setServerType] = useMpcServerType()
  const selectedPeers = useMpcPeers()
  const peerOptionsQuery = useMpcPeerOptionsQuery()
  const joinUrlQuery = useJoinKeygenUrlQuery()
  const keygenVault = useKeygenVault()
  const localPartyId = useMpcLocalPartyId()
  const opertaionType = useKeygenOperation()
  const targetDeviceCount = useTargetDeviceCount()

  const recommendedPeers = useMemo(() => {
    if (targetDeviceCount !== undefined) {
      return targetDeviceCount - 1
    }

    return !selectedPeers.length ? 2 : selectedPeers.length + 1
  }, [selectedPeers, targetDeviceCount])

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
    if (targetDeviceCount !== undefined) {
      return targetDeviceCount
    }

    if (isMigrate) {
      const { signers } = getRecordUnionValue(keygenVault, 'existingVault')

      return Math.max(signers.length, selectedPeers.length + 1)
    }

    if (peerOptionsQuery.data === undefined) {
      return minKeygenDevices
    }

    return Math.max(peerOptionsQuery.data.length + 1, minKeygenDevices)
  }, [
    targetDeviceCount,
    isMigrate,
    keygenVault,
    peerOptionsQuery.data,
    selectedPeers.length,
  ])

  const isDisabled = useMemo(() => {
    if (isMigrate && missingPeers.length > 0) {
      return `${t('missing_devices_for_migration')}: ${missingPeers.join(', ')}`
    }

    if (targetDeviceCount !== undefined) {
      const requiredPeers = targetDeviceCount - 1
      if (targetDeviceCount <= 3) {
        if (selectedPeers.length !== requiredPeers) {
          return t('select_n_devices', {
            count: requiredPeers - selectedPeers.length,
          })
        }
      } else {
        if (selectedPeers.length < requiredPeers) {
          return t('select_n_devices', {
            count: requiredPeers - selectedPeers.length,
          })
        }
      }
      return undefined
    }

    if (!selectedPeers.length) {
      return t('select_n_devices', { count: 1 })
    }
  }, [isMigrate, missingPeers, selectedPeers.length, t, targetDeviceCount])

  const showOptionalDevice = useMemo(() => {
    if (isMigrate) return false
    if (targetDeviceCount !== undefined && targetDeviceCount <= 3) return false

    return true
  }, [isMigrate, targetDeviceCount])

  const isSecureTargetFlow = !isMigrate && targetDeviceCount !== undefined
  const missingDevicesCount =
    targetDeviceCount === undefined
      ? 0
      : Math.max(0, targetDeviceCount - 1 - selectedPeers.length)

  return (
    <>
      <MpcPeersCorrector />
      <AutoStartKeygen onFinish={onFinish} />
      {isSecureTargetFlow ? (
        <SecureVaultPeerDiscoveryScreen
          isDisabled={isDisabled}
          isLocalModeAvailable={isLocalModeAvailable}
          joinUrlQuery={joinUrlQuery}
          localPartyId={localPartyId}
          missingDevicesCount={missingDevicesCount}
          onBack={onBack}
          onFinish={onFinish}
          onToggleServerType={() =>
            setServerType(getPairComplement(mpcServerTypes, serverType))
          }
          peerOptionsQuery={peerOptionsQuery}
          serverType={serverType}
          targetDeviceCount={targetDeviceCount}
        />
      ) : (
        <>
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
                      isMigrate || targetDeviceCount !== undefined ? null : (
                        <KeygenDevicesRequirementsInfo />
                      )
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
                          : Math.max(0, recommendedPeers - peerOptions.length)

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
                                        name: parseLocalPartyId(
                                          missingPeers[index]
                                        ).deviceName,
                                      })
                                    : t('scan_with_device_index', {
                                        index: index + peerOptions.length + 1,
                                      })}
                                </PeerPlaceholder>
                              )
                            })}
                            {showOptionalDevice && (
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
                    {targetDeviceCount !== undefined &&
                      peerOptionsQuery.data === undefined &&
                      range(recommendedPeers).map(index => (
                        <PeerPlaceholder key={index}>
                          {t('scan_with_device_index', {
                            index: index + 1,
                          })}
                        </PeerPlaceholder>
                      ))}
                  </PeersContainer>
                </PeersManagerFrame>
              </PeersPageContentFrame>
              <PeerDiscoveryFormFooter isDisabled={isDisabled} />
            </PageFormFrame>
          </FitPageContent>
        </>
      )}
      <KeygenPeerDiscoveryEducation />
    </>
  )
}
