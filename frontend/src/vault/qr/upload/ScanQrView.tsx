import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../../lib/ui/buttons/Button';
import { takeWholeSpaceAbsolutely } from '../../../lib/ui/css/takeWholeSpaceAbsolutely';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { FlowErrorPageContent } from '../../../ui/flow/FlowErrorPageContent';
import { FlowPendingPageContent } from '../../../ui/flow/FlowPendingPageContent';
import { PageContent } from '../../../ui/page/PageContent';

const Container = styled(PageContent)`
  position: relative;
  justify-content: flex-end;
`;

const Video = styled.video`
  ${takeWholeSpaceAbsolutely}
  object-fit: cover;
`;

type ScanQrViewProps = {
  onUploadQrViewRequest: () => void;
};

export const ScanQrView = ({ onUploadQrViewRequest }: ScanQrViewProps) => {
  const { t } = useTranslation();
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  const { mutate: getStream, ...streamMutationState } = useMutation({
    mutationFn: () => navigator.mediaDevices.getUserMedia({ video: true }),
  });

  const { data: stream } = streamMutationState;

  useEffect(() => {
    if (!stream || !video) return;

    video.srcObject = stream;
    video.play();

    return () => stream.getTracks().forEach(track => track.stop());
  }, [video, stream]);

  useEffect(getStream, [getStream]);

  return (
    <Container>
      <QueryDependant
        query={streamMutationState}
        success={() => <Video ref={setVideo} muted />}
        pending={() => (
          <FlowPendingPageContent title={t('getting_video_permission')} />
        )}
        error={() => (
          <FlowErrorPageContent title={t('failed_to_get_video_permission')} />
        )}
      />

      <Button onClick={onUploadQrViewRequest}>
        {t('upload_qr_code_image')}
      </Button>
    </Container>
  );
};
