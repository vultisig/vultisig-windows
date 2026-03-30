import { initZxing, readQrCode } from '@core/ui/qr/utils/readQrCode'
import { Button } from '@lib/ui/buttons/Button'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlowErrorPageContent } from '../../flow/FlowErrorPageContent'

const Video = styled.video`
  height: 100%;
  object-fit: cover;
  width: 100%;
`

export const QrScanner = ({ onFinish }: OnFinishProp<string>) => {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const { mutate: getStream, ...streamMutationState } = useMutation({
    mutationFn: () =>
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: {
            min: 640,
            ideal: 3840,
            max: 4096,
          },
          height: {
            min: 480,
            ideal: 2160,
            max: 4096,
          },
          frameRate: {
            ideal: 60,
            max: 60,
          },
        },
      }),
  })

  const { data: stream, reset: resetStreamState } = streamMutationState

  useEffect(() => {
    if (!stream) return

    const [track] = stream.getVideoTracks()
    if (!track) return

    const capabilities = track.getCapabilities()
    const constraints: MediaTrackConstraints = {}

    if (capabilities.width && typeof capabilities.width.max === 'number') {
      constraints.width = { ideal: capabilities.width.max }
    }
    if (capabilities.height && typeof capabilities.height.max === 'number') {
      constraints.height = { ideal: capabilities.height.max }
    }
    if (
      Array.isArray(capabilities.facingMode) &&
      capabilities.facingMode.includes('environment')
    ) {
      constraints.facingMode = 'environment'
    }

    if (Object.keys(constraints).length > 0) {
      attempt(() => track.applyConstraints(constraints))
    }
  }, [stream])

  useEffect(() => {
    const video = videoRef.current
    if (!stream || !video) return

    video.srcObject = stream
    video.play()

    return () => {
      stream.getTracks().forEach(track => track.stop())

      if (video) {
        video.srcObject = null
      }
    }
  }, [stream])

  useEffect(getStream, [getStream])

  useEffect(() => {
    initZxing()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    let animationFrameId: number
    let stopped = false

    const scan = async () => {
      if (stopped) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const { data } = await attempt(
        readQrCode({
          canvasContext: context,
          image: video,
        })
      )

      if (data) {
        onFinish(data)
      } else if (!stopped) {
        animationFrameId = requestAnimationFrame(() => {
          scan()
        })
      }
    }

    animationFrameId = requestAnimationFrame(scan)

    return () => {
      stopped = true
      cancelAnimationFrame(animationFrameId)
    }
  }, [onFinish, stream])

  return (
    <MatchQuery
      value={streamMutationState}
      success={() => <Video ref={videoRef} muted />}
      pending={() => (
        <Center>
          <Spinner size="3em" />
        </Center>
      )}
      error={error => (
        <FlowErrorPageContent
          title={t('failed_to_get_video_permission')}
          error={error}
          action={
            <Button
              onClick={() => {
                resetStreamState()
                getStream()
              }}
            >
              {t('try_again')}
            </Button>
          }
        />
      )}
    />
  )
}
