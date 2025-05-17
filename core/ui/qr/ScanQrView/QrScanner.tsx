import { Button } from '@lib/ui/buttons/Button'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { Image } from '@lib/ui/image/Image'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { attempt, withFallback } from '@lib/utils/attempt'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { readQrCode } from '../utils/readQrCode'
import { BorderImageWrapper, Video, VideoWrapper } from './ScanQrView.styled'

export const QrScanner = ({ onFinish }: OnFinishProp<string>) => {
  const { t } = useTranslation()
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)

  const { mutate: getStream, ...streamMutationState } = useMutation({
    mutationFn: () =>
      navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            min: 640,
            ideal: 1920,
            max: 3840,
          },
          height: {
            min: 480,
            ideal: 1080,
            max: 2160,
          },
          frameRate: {
            ideal: 30,
            max: 60,
          },
        },
      }),
  })

  const { data: stream, reset: resetStreamState } = streamMutationState

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

    const scan = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const scanData = withFallback(
        attempt(() =>
          readQrCode({
            canvasContext: context,
            image: video,
          })
        ),
        undefined
      )

      if (scanData) {
        onFinish(scanData)
      } else {
        animationFrameId = requestAnimationFrame(scan)
      }
    }

    animationFrameId = requestAnimationFrame(scan)

    return () => cancelAnimationFrame(animationFrameId)
  }, [onFinish, video])

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
        <CenterAbsolutely>
          <Spinner size="3em" />
        </CenterAbsolutely>
      )}
      error={error => (
        <FlowErrorPageContent
          title={t('failed_to_get_video_permission')}
          message={extractErrorMsg(error)}
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
