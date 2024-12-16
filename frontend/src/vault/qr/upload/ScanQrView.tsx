import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../../lib/ui/buttons/Button';
import { takeWholeSpaceAbsolutely } from '../../../lib/ui/css/takeWholeSpaceAbsolutely';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { attempt } from '../../../lib/utils/attempt';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { FlowErrorPageContent } from '../../../ui/flow/FlowErrorPageContent';
import { FlowPendingPageContent } from '../../../ui/flow/FlowPendingPageContent';
import { PageContent } from '../../../ui/page/PageContent';
import { readQrCode } from './utils/readQrCode';

const Container = styled(PageContent)`
  position: relative;
  justify-content: flex-end;
`;

const Video = styled.video`
  ${takeWholeSpaceAbsolutely}
  object-fit: cover;
`;

type ScanQrViewProps = {
  onUploadQrViewRequest?: () => void;
  onScanSuccess: (value: string) => void;
  className?: string;
};

export const ScanQrView = ({
  onUploadQrViewRequest,
  onScanSuccess,
  className,
}: ScanQrViewProps) => {
  // Keep success callback in ref to avoid adding it to useEffect deps on line 107
  const onScanSuccessRef = useRef(onScanSuccess);
  if (onScanSuccessRef.current !== onScanSuccess) {
    onScanSuccessRef.current = onScanSuccess;
  }

  const { t } = useTranslation();
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const navigate = useAppNavigate();

  const { mutate: getStream, ...streamMutationState } = useMutation({
    mutationFn: () =>
      navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      }),
  });

  const { data: stream, reset: resetStreamState } = streamMutationState;

  useEffect(() => {
    if (!stream || !video) return;

    video.srcObject = stream;
    video.play();

    return () => stream.getTracks().forEach(track => track.stop());
  }, [video, stream]);

  useEffect(getStream, [getStream]);

  useEffect(() => {
    if (!video) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return;

    let animationFrameId: number;

    const scan = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const scanData = attempt(
        () =>
          readQrCode({
            canvasContext: context,
            image: video,
          }),
        undefined
      );

      if (scanData) {
        onScanSuccessRef.current(scanData);
      } else {
        animationFrameId = requestAnimationFrame(scan);
      }
    };

    animationFrameId = requestAnimationFrame(scan);

    return () => cancelAnimationFrame(animationFrameId);
  }, [navigate, video]);

  return (
    <Container className={className}>
      <MatchQuery
        value={streamMutationState}
        success={() => <Video ref={setVideo} muted />}
        pending={() => (
          <FlowPendingPageContent title={t('getting_video_permission')} />
        )}
        error={() => (
          <FlowErrorPageContent
            title={t('failed_to_get_video_permission')}
            action={
              <Button
                onClick={() => {
                  resetStreamState();
                  getStream();
                }}
              >
                {t('try_again')}
              </Button>
            }
          />
        )}
      />
      {onUploadQrViewRequest && (
        <Button onClick={onUploadQrViewRequest}>
          {t('upload_qr_code_image')}
        </Button>
      )}
    </Container>
  );
};
