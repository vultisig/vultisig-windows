import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'react-use';
import styled from 'styled-components';

import { MultistepProgressIndicator } from '../../../lib/ui/flow/MultistepProgressIndicator';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text, text } from '../../../lib/ui/text';

type KeygenEducation = {
  title: ReactNode;
  content: ReactNode;
};

const Content = styled.p`
  ${text({
    size: 14,
    weight: '600',
    height: 'large',
    color: 'contrast',
    centerHorizontally: true,
  })}

  max-width: 320px;
  min-height: 80px;

  b {
    ${text({
      color: 'primary',
    })}
  }
`;

export const KeygenEducation = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState<number>(0);

  const items: KeygenEducation[] = [
    {
      title: t('join_keygen_slider1_title'),
      content: (
        <>
          {t('join_keygen_slider1_note1')}{' '}
          <b>{t('join_keygen_slider1_note2')}</b>.{' '}
          {t('join_keygen_slider1_note3')}
        </>
      ),
    },
    {
      title: t('join_keygen_slider2_title'),
      content: (
        <>
          <b>{t('join_keygen_slider2_note1')}</b>!{' '}
          {t('join_keygen_slider2_note2')}
        </>
      ),
    },
    {
      title: t('join_keygen_slider3_title'),
      content: (
        <>
          {t('join_keygen_slider3_note1')}{' '}
          <b>{t('join_keygen_slider3_note2')}</b>.{' '}
          {t('join_keygen_slider3_note3')}
        </>
      ),
    },
    {
      title: t('join_keygen_slider4_title'),
      content: (
        <>
          {t('join_keygen_slider4_note1')}{' '}
          <b>{t('join_keygen_slider4_note2')}</b>{' '}
          {t('join_keygen_slider4_note3')}
        </>
      ),
    },
    {
      title: t('join_keygen_slider5_title'),
      content: (
        <>
          {t('join_keygen_slider5_note1')}{' '}
          <b>{t('join_keygen_slider5_note2')}</b>{' '}
          {t('join_keygen_slider5_note3')}
        </>
      ),
    },
    {
      title: t('join_keygen_slider6_title'),
      content: (
        <>
          {t('join_keygen_slider6_note1')}{' '}
          <b>{t('join_keygen_slider6_note2')}</b>.
        </>
      ),
    },
    {
      title: t('join_keygen_slider7_title'),
      content: (
        <>
          {t('join_keygen_slider7_note1')}{' '}
          <b>{t('join_keygen_slider7_note2')}</b>
          {', '}
          {t('join_keygen_slider7_note3')}
        </>
      ),
    },
  ];

  useInterval(() => {
    setIndex(prevIndex => (prevIndex + 1) % items.length);
  }, 3000);

  const { content, title } = items[index];

  return (
    <VStack alignItems="center" justifyContent="center" gap={48}>
      <VStack alignItems="center" justifyContent="center" gap={24}>
        <Text color="contrast" weight="700" size={16}>
          {title}
        </Text>
        <Content>{content}</Content>
      </VStack>
      <MultistepProgressIndicator value={index} steps={items.length} />
    </VStack>
  );
};
