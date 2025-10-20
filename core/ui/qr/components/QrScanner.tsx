import {
  BorderImageWrapper,
  Video,
  VideoWrapper,
} from '@core/ui/qr/components/styles'
import { readQrCode } from '@core/ui/qr/utils/readQrCode'
import { Button } from '@lib/ui/buttons/Button'
import { Image } from '@lib/ui/image/Image'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { attempt } from '@lib/utils/attempt'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../flow/FlowErrorPageContent'

type QrScannerProps = OnFinishProp<string> & {
  onError?: (error: Error) => void
}

export const QrScanner = ({ onFinish, onError }: QrScannerProps) => {
  const { t } = useTranslation()
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)

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
    if (!stream || !video) return

    video.srcObject = stream
    video.play()

    return () => {
      stream.getTracks().forEach(track => track.stop())

      if (video) {
        video.srcObject = null
      }
    }
  }, [video, stream])

  useEffect(getStream, [getStream])

  useEffect(() => {
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

      const { data, error } = await attempt(
        readQrCode({
          canvasContext: context,
          image: video,
        })
      )

      if (data) {
        onFinish(data)
      } else if (error && onError) {
        onError(error instanceof Error ? error : new Error(String(error)))
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
  }, [onFinish, onError, stream, video])

  return (
    <MatchQuery
      value={streamMutationState}
      success={() => (
        <VideoWrapper>
          <Video ref={setVideo} muted />
          <BorderImageWrapper>
            <Image src="/core/images/borderedWrapper.svg" alt="" />
          </BorderImageWrapper>
        </VideoWrapper>
      )}
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
