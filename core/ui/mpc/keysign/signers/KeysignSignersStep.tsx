import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { InitiatingDevice } from '@core/ui/mpc/devices/peers/InitiatingDevice'
import { PeerOption } from '@core/ui/mpc/devices/peers/option/PeerOption'
import { PeerDiscoveryFormFooter } from '@core/ui/mpc/devices/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '@core/ui/mpc/devices/peers/PeerPlaceholder'
import { PeersContainer } from '@core/ui/mpc/devices/peers/PeersContainer'
import { PeersManagerFrame } from '@core/ui/mpc/devices/peers/PeersManagerFrame'
import { PeersPageContentFrame } from '@core/ui/mpc/devices/peers/PeersPageContentFrame'
import { DownloadKeysignQrCode } from '@core/ui/mpc/keysign/DownloadKeysignQrCode'
import { useJoinKeysignUrlQuery } from '@core/ui/mpc/keysign/queries/useJoinKeysignUrlQuery'
import { MpcLocalServerIndicator } from '@core/ui/mpc/server/MpcLocalServerIndicator'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageFormFrame } from '@lib/ui/page/PageFormFrame'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { QueryBasedQrCode } from '@lib/ui/qr/QueryBasedQrCode'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { range } from '@lib/utils/array/range'
import { without } from '@lib/utils/array/without'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MpcSignersTitle } from '../../devices/peers/MpcSignersTitle'
import { useMpcSignersQuery } from '../../devices/queries/queries/useMpcSignersQuery'
import { useMpcLocalPartyId } from '../../state/mpcLocalPartyId'

type KeysignSignersStepProps = {
  payload: KeysignMessagePayload
  onFinish: (peers: string[]) => void
}

export const KeysignSignersStep = ({
  onFinish,
  payload,
}: KeysignSignersStepProps) => {
  const { t } = useTranslation()

  const { signers } = useCurrentVault()

  const signersQuery = useMpcSignersQuery()

  const [excludedPeers, setExcludedPeers] = useState<string[]>([])

  const sessionSigners = useMemo(
    () => without(signersQuery.data ?? [], ...excludedPeers),
    [signersQuery.data, excludedPeers]
  )

  const isDisabled = useMemo(() => {
    const requiredDevicesNumber = getKeygenThreshold(signers.length)

    const requiredPeersNumber = requiredDevicesNumber - 1
    if (sessionSigners.length < requiredDevicesNumber) {
      return t('select_n_devices', { count: requiredPeersNumber })
    }
  }, [sessionSigners.length, signers.length, t])

  useEffect(() => {
    if (!isDisabled) {
      onFinish(sessionSigners)
    }
  }, [isDisabled, onFinish, sessionSigners])

  const joinUrlQuery = useJoinKeysignUrlQuery(payload)

  const [serverType] = useMpcServerType()

  const requiredSigners = getKeygenThreshold(signers.length)
  const requiredPeers = requiredSigners - 1

  const localPartyId = useMpcLocalPartyId()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DownloadKeysignQrCode />}
        title={t('scan_qr')}
        hasBorder
      />
      <FitPageContent>
        <PageFormFrame>
          <PeersPageContentFrame>
            <QueryBasedQrCode value={joinUrlQuery} />
            <PeersManagerFrame>
              {serverType === 'local' && <MpcLocalServerIndicator />}
              <MpcSignersTitle
                target={requiredSigners}
                current={sessionSigners.length}
              />
              <PeersContainer>
                <InitiatingDevice />
                <MatchQuery
                  value={signersQuery}
                  success={signers => {
                    const peerOptions = without(signers, localPartyId)
                    return (
                      <>
                        {peerOptions.map(id => (
                          <PeerOption
                            key={id}
                            id={id}
                            value={!excludedPeers.includes(id)}
                            onChange={value =>
                              setExcludedPeers(prev =>
                                value ? without(prev, id) : [...prev, id]
                              )
                            }
                          />
                        ))}
                        {range(requiredPeers - peerOptions.length).map(
                          index => (
                            <PeerPlaceholder key={index}>
                              {t('scan_with_device_index', {
                                index: index + peerOptions.length + 1,
                              })}
                            </PeerPlaceholder>
                          )
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
    </>
  )
}
